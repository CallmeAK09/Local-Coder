import os
from pathlib import Path
from django.conf import settings
from rest_framework.exceptions import ValidationError, PermissionDenied

LANGUAGE_EXTENSIONS = {
    '.py': 'python',
    '.js': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.c': 'c',
    '.h': 'c',
    '.java': 'java',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.json': 'json',
    '.md': 'markdown',
    '.txt': 'plaintext',
    '.pdf': 'pdf',
    '.sh': 'shell',
    '.sql': 'sql',
    '.xml': 'xml',
}

def detect_language(path_str: str) -> str:
    ext = Path(path_str).suffix.lower()
    return LANGUAGE_EXTENSIONS.get(ext, 'plaintext')

def get_workspace_root() -> Path:
    root = Path(settings.WORKSPACE_ROOT).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root

def resolve_workspace_path(relative_path: str, allow_root: bool = False) -> Path:
    """
    Safely resolves a relative path within the workspace root.
    Guarantees protection against directory traversal attacks.
    """
    if not relative_path and not allow_root:
        raise ValidationError({"error": "Path cannot be empty."})
    
    clean_path = (relative_path or '').strip().lstrip('/\\')
    root = get_workspace_root()
    
    try:
        resolved = (root / clean_path).resolve()
    except Exception as e:
        raise ValidationError({"error": f"Invalid path structure: {str(e)}"})
    
    # Prevent traversal: ensure resolved path starts with root
    try:
        resolved.relative_to(root)
    except ValueError:
        raise PermissionDenied("Access denied: Attempted directory traversal outside workspace.")
    
    return resolved

def get_relative_workspace_path(absolute_path: Path) -> str:
    root = get_workspace_root()
    try:
        rel = absolute_path.resolve().relative_to(root)
        return str(rel).replace('\\', '/')
    except ValueError:
        return ""

def build_tree(current_path: Path = None):
    root = get_workspace_root()
    if current_path is None:
        current_path = root

    items = []
    try:
        entries = sorted(list(current_path.iterdir()), key=lambda x: (not x.is_dir(), x.name.lower()))
    except Exception:
        return items

    for entry in entries:
        # Ignore hidden files like .git or .DS_Store
        if entry.name.startswith('.'):
            continue
            
        rel_path = get_relative_workspace_path(entry)
        item = {
            "name": entry.name,
            "path": rel_path,
            "is_dir": entry.is_dir(),
            "extension": entry.suffix.lower() if not entry.is_dir() else "",
            "language": detect_language(entry.name) if not entry.is_dir() else None,
        }
        
        if entry.is_dir():
            item["children"] = build_tree(entry)
        else:
            try:
                item["size"] = entry.stat().st_size
                item["modified"] = entry.stat().st_mtime
            except OSError:
                item["size"] = 0
                item["modified"] = 0
                
        items.append(item)
    return items

