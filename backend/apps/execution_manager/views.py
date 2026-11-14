import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.workspace_manager.utils import resolve_workspace_path, detect_language
from .runner import execute_code, stop_process
from .models import ExecutionHistory
from .serializers import ExecutionHistorySerializer

class ExecuteCodeView(APIView):
    """
    Executes a program file inside the workspace.
    Supports stdin input, custom timeout, and immediate process stopping.
    """
    def post(self, request):
        path = request.data.get('path', '')
        stdin_data = request.data.get('stdin', '')
        timeout = request.data.get('timeout', 20)
        exec_id = request.data.get('exec_id') or str(uuid.uuid4())
        content = request.data.get('content', None)

        if not path:
            return Response({"error": "Field 'path' is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure timeout bounds
        try:
            timeout_sec = max(1, min(int(timeout), 60))
        except (ValueError, TypeError):
            timeout_sec = 20

        # If content was provided (e.g. quick run without manual Ctrl+S first), save it to file
        if content is not None:
            try:
                target = resolve_workspace_path(path)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content, encoding='utf-8')
            except Exception as e:
                return Response({"error": f"Failed to save current file buffer: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Run execution
        result = execute_code(
            file_path_rel=path,
            stdin_data=stdin_data,
            timeout_sec=timeout_sec,
            exec_id=exec_id
        )

        lang = detect_language(path)

        # Record in history (only for executable languages)
        if lang not in ('html', 'css'):
            try:
                ExecutionHistory.objects.create(
                    file_path=path,
                    language=lang,
                    status=result.get('status', 'ERROR'),
                    exit_code=result.get('exit_code'),
                    stdout=result.get('stdout', ''),
                    stderr=result.get('stderr', ''),
                    compilation_error=result.get('compilation_error', ''),
                    execution_time_ms=result.get('execution_time_ms', 0),
                    stdin_input=stdin_data
                )
            except Exception:
                pass

        result['exec_id'] = exec_id
        result['language'] = lang
        result['file_path'] = path
        return Response(result, status=status.HTTP_200_OK)

class StopExecutionView(APIView):
    """
    Stops a running process by its exec_id.
    """
    def post(self, request):
        exec_id = request.data.get('exec_id')
        if not exec_id:
            return Response({"error": "Field 'exec_id' is required."}, status=status.HTTP_400_BAD_REQUEST)

        stopped = stop_process(exec_id)
        return Response({
            "success": stopped,
            "exec_id": exec_id,
            "message": "Process terminated successfully." if stopped else "Process was not running or already completed."
        })

class ExecutionHistoryView(APIView):
    """
    Fetches or clears execution history.
    """
    def get(self, request):
        history = ExecutionHistory.objects.all()[:50]
        serializer = ExecutionHistorySerializer(history, many=True)
        return Response(serializer.data)

    def delete(self, request):
        ExecutionHistory.objects.all().delete()
        return Response({"success": True, "message": "Execution history cleared."})
