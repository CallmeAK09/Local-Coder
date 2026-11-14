import os
import sys
import time
from pathlib import Path
from django.conf import settings

PROJECT_ROOT = settings.BASE_DIR.parent
RUN_SH = (PROJECT_ROOT / 'run.sh').resolve()

def terminate_server():
    """
    Safely exits ONLY this Python process.
    Never sends signals to any other PID, PPID, or process group.
    """
    # 1. Clean or trim server.log if >= 100 lines
    log_file = settings.BASE_DIR / 'server.log'
    if log_file.exists():
        try:
            with open(log_file, 'r', encoding='utf-8', errors='replace') as f:
                lines = f.readlines()
            if len(lines) >= 100:
                log_file.unlink(missing_ok=True)
        except Exception:
            pass

    # 2. Exit current process only
    os._exit(0)

def record_heartbeat(session_id):
    pass

def record_client_leave(session_id):
    pass

def sync_pwa_launchers():
    """
    Finds Chrome/Chromium PWA desktop entries created when the user installs the PWA
    and hooks them directly to `run.sh --pwa`.
    """
    if sys.platform != 'linux':
        return {"synced": False, "reason": "not linux"}

    home = Path.home()
    search_dirs = [
        home / 'Desktop',
        home / '.local/share/applications'
    ]

    target_cmd = f'"{RUN_SH}" --pwa'
    synced_files = []

    for sdir in search_dirs:
        if not sdir.exists():
            continue
        for file in sdir.glob('chrome-*.desktop'):
            try:
                content = file.read_text(encoding='utf-8')
                if 'Local Compiler' in content or 'mngloiodpbedloingimookgdhhkgcblo' in content:
                    lines = content.splitlines()
                    new_lines = []
                    for line in lines:
                        if line.startswith('Exec='):
                            new_lines.append(f'Exec={target_cmd}')
                        else:
                            new_lines.append(line)

                    file.write_text('\n'.join(new_lines) + '\n', encoding='utf-8')
                    file.chmod(0o755)
                    synced_files.append(str(file))
            except Exception:
                pass

    return {"synced": True, "files": synced_files}
