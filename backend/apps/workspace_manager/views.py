import mimetypes
import shutil
from pathlib import Path
from django.http import HttpResponse, FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, PermissionDenied
from .utils import (
    resolve_workspace_path,
    get_workspace_root,
    get_relative_workspace_path,
    build_tree,
    detect_language
)

class WorkspaceTreeView(APIView):
    """
    Returns the full file tree of the workspace.
    """
    def get(self, request):
        tree = build_tree()
        root_path = str(get_workspace_root())
        return Response({
            "workspace_root": root_path,
            "tree": tree
        })

class FileDetailView(APIView):
    """
    Reads or saves a file in the workspace.
    """
    def get(self, request):
        path = request.query_params.get('path', '')
        if not path:
            return Response({"error": "Query param 'path' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        target = resolve_workspace_path(path)
        if not target.exists() or not target.is_file():
            return Response({"error": f"File '{path}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            content = target.read_text(encoding='utf-8', errors='replace')
        except Exception as e:
            return Response({"error": f"Failed to read file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "path": get_relative_workspace_path(target),
            "name": target.name,
            "content": content,
            "language": detect_language(target.name),
            "size": target.stat().st_size,
            "modified": target.stat().st_mtime
        })

    def post(self, request):
        path = request.data.get('path', '')
        content = request.data.get('content', '')
        
        if not path:
            return Response({"error": "Field 'path' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        target = resolve_workspace_path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            target.write_text(content, encoding='utf-8')
        except Exception as e:
            return Response({"error": f"Failed to write file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "success": True,
            "path": get_relative_workspace_path(target),
            "name": target.name,
            "language": detect_language(target.name),
            "size": target.stat().st_size,
            "modified": target.stat().st_mtime
        }, status=status.HTTP_200_OK)

class CreateFolderView(APIView):
    """
    Creates a new directory in the workspace.
    """
    def post(self, request):
        path = request.data.get('path', '')
        if not path:
            return Response({"error": "Field 'path' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        target = resolve_workspace_path(path)
        if target.exists():
            return Response({"error": "Directory or file already exists at this path."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            return Response({"error": f"Failed to create folder: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "success": True,
            "path": get_relative_workspace_path(target),
            "name": target.name
        }, status=status.HTTP_201_CREATED)

class RenameItemView(APIView):
    """
    Renames/moves a file or folder within the workspace.
    """
    def post(self, request):
        old_path = request.data.get('old_path', '')
        new_path = request.data.get('new_path', '')
        
        if not old_path or not new_path:
            return Response({"error": "Both 'old_path' and 'new_path' are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        src = resolve_workspace_path(old_path)
        dest = resolve_workspace_path(new_path)
        
        if not src.exists():
            return Response({"error": f"Source item '{old_path}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        if dest.exists():
            return Response({"error": f"Destination item '{new_path}' already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            shutil.move(str(src), str(dest))
        except Exception as e:
            return Response({"error": f"Failed to rename: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "success": True,
            "old_path": old_path,
            "new_path": get_relative_workspace_path(dest),
            "name": dest.name,
            "is_dir": dest.is_dir()
        })

class DeleteItemView(APIView):
    """
    Deletes a file or directory from the workspace.
    """
    def post(self, request):
        path = request.data.get('path', '')
        if not path:
            return Response({"error": "Field 'path' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        target = resolve_workspace_path(path)
        if not target.exists():
            return Response({"error": f"Item '{path}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        if target == get_workspace_root():
            return Response({"error": "Cannot delete root workspace directory."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if target.is_dir():
                shutil.rmtree(str(target))
            else:
                target.unlink()
        except Exception as e:
            return Response({"error": f"Failed to delete item: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"success": True, "path": path})

class PreviewServeView(APIView):
    """
    Serves workspace files with correct Content-Type for HTML & Markdown sandboxed preview.
    """
    def get(self, request, subpath=''):
        if not subpath:
            subpath = 'index.html'
        
        try:
            target = resolve_workspace_path(subpath)
        except (ValidationError, PermissionDenied):
            raise Http404("Invalid preview path.")
            
        if not target.exists() or not target.is_file():
            raise Http404(f"Preview file '{subpath}' not found.")
        
        # Render Markdown files as modern GitHub-styled HTML
        if target.suffix.lower() in ('.md', '.markdown'):
            try:
                import markdown
                raw_text = target.read_text(encoding='utf-8', errors='replace')
                html_body = markdown.markdown(raw_text, extensions=['extra', 'codehilite', 'toc', 'tables'])
                full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{target.name} - Markdown Preview</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: #e2e8f0;
      background: #0d1117;
      margin: 0;
      padding: 2rem 1.5rem;
      max-width: 880px;
      margin: 0 auto;
    }}
    h1, h2, h3, h4, h5, h6 {{
      color: #f8fafc;
      border-bottom: 1px solid #30363d;
      padding-bottom: 0.3em;
      margin-top: 1.6em;
      margin-bottom: 0.8em;
      font-weight: 600;
    }}
    h1 {{ font-size: 2rem; border-bottom: 2px solid #38bdf8; }}
    h2 {{ font-size: 1.5rem; }}
    h3 {{ font-size: 1.25rem; }}
    p {{ margin: 0.8em 0; }}
    a {{ color: #38bdf8; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    code {{
      background: #161b22;
      padding: 0.2em 0.45em;
      border-radius: 4px;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 88%;
      color: #facc15;
      border: 1px solid #30363d;
    }}
    pre {{
      background: #161b22;
      padding: 1.2rem;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid #30363d;
      margin: 1.2em 0;
    }}
    pre code {{
      background: none;
      padding: 0;
      color: #e2e8f0;
      border: none;
      font-size: 90%;
    }}
    blockquote {{
      border-left: 4px solid #38bdf8;
      margin: 1em 0;
      padding: 0.5em 1rem;
      background: rgba(56, 189, 248, 0.05);
      border-radius: 0 4px 4px 0;
      color: #94a3b8;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin: 1.2rem 0;
    }}
    th, td {{
      border: 1px solid #30363d;
      padding: 8px 14px;
      text-align: left;
    }}
    th {{
      background: #161b22;
      color: #f8fafc;
      font-weight: 600;
    }}
    tr:nth-child(even) {{ background: #111620; }}
    hr {{
      border: none;
      border-top: 1px solid #30363d;
      margin: 2rem 0;
    }}
    ul, ol {{ padding-left: 2rem; margin: 0.8em 0; }}
    li {{ margin: 0.3em 0; }}
    img {{ max-width: 100%; border-radius: 6px; }}
  </style>
</head>
<body>
  {html_body}
</body>
</html>"""
                return HttpResponse(full_html, content_type='text/html')
            except Exception as e:
                # Fallback to plain html display if markdown parser error
                content = target.read_text(encoding='utf-8', errors='replace')
                return HttpResponse(f"<pre style='color:#e2e8f0;background:#0d1117;padding:1rem;'>{content}</pre>", content_type='text/html')

        content_type, _ = mimetypes.guess_type(target.name)
        if not content_type:
            if target.suffix == '.js':
                content_type = 'application/javascript'
            elif target.suffix == '.css':
                content_type = 'text/css'
            elif target.suffix in ('.html', '.htm'):
                content_type = 'text/html'
            else:
                content_type = 'text/plain'
        
        try:
            return FileResponse(open(target, 'rb'), content_type=content_type)
        except Exception as e:
            return HttpResponse(f"Error serving preview: {str(e)}", status=500)
