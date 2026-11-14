import os
import sys
import time
import signal
import shutil
import subprocess
import threading
from pathlib import Path
from typing import Dict, Any, Optional

from apps.workspace_manager.utils import resolve_workspace_path, detect_language

# Global registry for active running processes
ACTIVE_PROCESSES: Dict[str, Dict[str, Any]] = {}
PROCESS_LOCK = threading.Lock()

MAX_OUTPUT_LENGTH = 300_000  # 300 KB limit for output display

def register_process(exec_id: str, proc: subprocess.Popen, temp_files: list = None):
    with PROCESS_LOCK:
        ACTIVE_PROCESSES[exec_id] = {
            'proc': proc,
            'start_time': time.time(),
            'temp_files': temp_files or [],
            'stopped': False
        }

def unregister_process(exec_id: str):
    with PROCESS_LOCK:
        return ACTIVE_PROCESSES.pop(exec_id, None)

def stop_process(exec_id: str) -> bool:
    with PROCESS_LOCK:
        entry = ACTIVE_PROCESSES.get(exec_id)
        if not entry:
            return False
        entry['stopped'] = True
        proc = entry.get('proc')
        
    if proc and proc.poll() is None:
        try:
            # Kill process group if posix
            if hasattr(os, 'killpg'):
                try:
                    os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
                except Exception:
                    proc.kill()
            else:
                proc.kill()
        except Exception:
            pass
        return True
    return False

def clean_temp_files(temp_files: list):
    for f in temp_files:
        try:
            p = Path(f)
            if p.exists():
                if p.is_dir():
                    shutil.rmtree(p, ignore_errors=True)
                else:
                    p.unlink(missing_ok=True)
        except Exception:
            pass

def truncate_output(text: str) -> str:
    if len(text) > MAX_OUTPUT_LENGTH:
        truncated_amount = len(text) - MAX_OUTPUT_LENGTH
        return text[:MAX_OUTPUT_LENGTH] + f"\n\n[... Output truncated: {truncated_amount} characters omitted ...]"
    return text

def execute_code(
    file_path_rel: str,
    stdin_data: str = "",
    timeout_sec: int = 20,
    exec_id: Optional[str] = None
) -> Dict[str, Any]:
    file_path = resolve_workspace_path(file_path_rel)
    if not file_path.exists() or not file_path.is_file():
        return {
            'status': 'ERROR',
            'exit_code': 1,
            'stdout': '',
            'stderr': f"File '{file_path_rel}' does not exist on disk.",
            'compilation_error': '',
            'execution_time_ms': 0
        }

    lang = detect_language(file_path.name)
    cwd = file_path.parent
    temp_files_to_clean = []

    # 1. Dependency checks and command construction
    compile_cmd = None
    run_cmd = []

    if lang == 'python':
        py_bin = shutil.which('python3') or shutil.which('python')
        if not py_bin:
            return {
                'status': 'ERROR',
                'exit_code': 127,
                'stdout': '',
                'stderr': 'Python 3 interpreter is not installed on the system.',
                'compilation_error': '',
                'execution_time_ms': 0
            }
        run_cmd = [py_bin, '-u', str(file_path)]

    elif lang == 'javascript':
        node_bin = shutil.which('node')
        if not node_bin:
            return {
                'status': 'ERROR',
                'exit_code': 127,
                'stdout': '',
                'stderr': 'Node.js is not installed on the system.',
                'compilation_error': '',
                'execution_time_ms': 0
            }
        run_cmd = [node_bin, str(file_path)]

    elif lang == 'c':
        gcc_bin = shutil.which('gcc')
        if not gcc_bin:
            return {
                'status': 'ERROR',
                'exit_code': 127,
                'stdout': '',
                'stderr': 'GCC compiler is not installed on the system.',
                'compilation_error': '',
                'execution_time_ms': 0
            }
        binary_name = file_path.stem + ("_c_bin.exe" if sys.platform == 'win32' else "_c_bin")
        out_bin = cwd / binary_name
        temp_files_to_clean.append(out_bin)
        compile_cmd = [gcc_bin, '-O2', '-Wall', str(file_path), '-o', str(out_bin), '-lm']
        run_cmd = [str(out_bin)]

    elif lang == 'java':
        javac_bin = shutil.which('javac')
        java_bin = shutil.which('java')
        if not javac_bin or not java_bin:
            return {
                'status': 'ERROR',
                'exit_code': 127,
                'stdout': '',
                'stderr': 'Java compiler (javac) or runtime (java) is not installed on the system.',
                'compilation_error': '',
                'execution_time_ms': 0
            }
        class_name = file_path.stem
        class_file = cwd / f"{class_name}.class"
        temp_files_to_clean.append(class_file)
        compile_cmd = [javac_bin, '-encoding', 'UTF-8', str(file_path)]
        run_cmd = [java_bin, '-cp', str(cwd), class_name]

    elif lang in ('html', 'css', 'markdown'):
        doc_type = 'Markdown document' if lang == 'markdown' else 'web document'
        return {
            'status': 'SUCCESS',
            'exit_code': 0,
            'stdout': f"'{file_path.name}' is a {doc_type} rendered live in the Browser Preview panel.",
            'stderr': '',
            'compilation_error': '',
            'execution_time_ms': 0
        }
    else:
        return {
            'status': 'ERROR',
            'exit_code': 1,
            'stdout': '',
            'stderr': f"Execution for language '{lang}' is not supported.",
            'compilation_error': '',
            'execution_time_ms': 0
        }

    start_wall_time = time.time()

    # Step 2: Compile if needed
    if compile_cmd:
        try:
            comp_proc = subprocess.run(
                compile_cmd,
                cwd=str(cwd),
                capture_output=True,
                text=True,
                timeout=15,
                shell=False
            )
            if comp_proc.returncode != 0:
                clean_temp_files(temp_files_to_clean)
                elapsed_ms = round((time.time() - start_wall_time) * 1000, 2)
                return {
                    'status': 'COMPILE_ERROR',
                    'exit_code': comp_proc.returncode,
                    'stdout': truncate_output(comp_proc.stdout or ''),
                    'stderr': '',
                    'compilation_error': truncate_output(comp_proc.stderr or comp_proc.stdout or 'Compilation failed.'),
                    'execution_time_ms': elapsed_ms
                }
        except subprocess.TimeoutExpired:
            clean_temp_files(temp_files_to_clean)
            return {
                'status': 'TIMEOUT',
                'exit_code': -1,
                'stdout': '',
                'stderr': '',
                'compilation_error': 'Compilation step timed out after 15 seconds.',
                'execution_time_ms': 15000
            }
        except Exception as e:
            clean_temp_files(temp_files_to_clean)
            return {
                'status': 'ERROR',
                'exit_code': 1,
                'stdout': '',
                'stderr': '',
                'compilation_error': f"Failed to execute compiler: {str(e)}",
                'execution_time_ms': round((time.time() - start_wall_time) * 1000, 2)
            }

    # Step 3: Run the program
    run_start = time.time()
    try:
        # Pre-exec fn to create a new session/process group for clean killing on posix
        preexec = os.setsid if hasattr(os, 'setsid') else None

        proc = subprocess.Popen(
            run_cmd,
            cwd=str(cwd),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=False,
            preexec_fn=preexec
        )

        if exec_id:
            register_process(exec_id, proc, temp_files_to_clean)

        stdout_data, stderr_data = proc.communicate(
            input=stdin_data if stdin_data else None,
            timeout=timeout_sec
        )
        elapsed_ms = round((time.time() - run_start) * 1000, 2)
        exit_code = proc.returncode

        stopped = False
        if exec_id:
            entry = unregister_process(exec_id)
            if entry and entry.get('stopped'):
                stopped = True

        status = 'TERMINATED' if stopped else ('SUCCESS' if exit_code == 0 else 'ERROR')

        clean_temp_files(temp_files_to_clean)
        return {
            'status': status,
            'exit_code': exit_code,
            'stdout': truncate_output(stdout_data or ''),
            'stderr': truncate_output(stderr_data or ''),
            'compilation_error': '',
            'execution_time_ms': elapsed_ms
        }

    except subprocess.TimeoutExpired:
        if exec_id:
            stop_process(exec_id)
            unregister_process(exec_id)
        else:
            try:
                proc.kill()
            except Exception:
                pass
        clean_temp_files(temp_files_to_clean)
        return {
            'status': 'TIMEOUT',
            'exit_code': -1,
            'stdout': '',
            'stderr': f"Execution timed out after {timeout_sec} seconds. Process was terminated.",
            'compilation_error': '',
            'execution_time_ms': round(timeout_sec * 1000, 2)
        }
    except Exception as e:
        if exec_id:
            unregister_process(exec_id)
        clean_temp_files(temp_files_to_clean)
        return {
            'status': 'ERROR',
            'exit_code': 1,
            'stdout': '',
            'stderr': f"Runtime execution failed: {str(e)}",
            'compilation_error': '',
            'execution_time_ms': round((time.time() - run_start) * 1000, 2)
        }

