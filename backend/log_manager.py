import sys
import os
from collections import deque
from pathlib import Path

def main():
    log_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("server.log")
    max_lines = int(sys.argv[2]) if len(sys.argv) > 2 else 100

    log_path.parent.mkdir(parents=True, exist_ok=True)
    buffer = deque(maxlen=max_lines)

    # Read existing content if present, capping to max_lines
    if log_path.exists():
        try:
            with open(log_path, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    buffer.append(line)
        except Exception:
            pass

    # Read lines from standard input in unbuffered fashion
    for raw_line in sys.stdin:
        buffer.append(raw_line)
        try:
            with open(log_path, "w", encoding="utf-8", errors="replace") as f:
                f.writelines(buffer)
                f.flush()
        except Exception:
            pass

if __name__ == "__main__":
    main()

