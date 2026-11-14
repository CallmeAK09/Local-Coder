#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Auto-detect virtual environment if user ran system python directly
        base_dir = Path(__file__).resolve().parent
        candidates = [
            base_dir.parent / 'venv' / 'bin' / 'python',
            base_dir / 'venv' / 'bin' / 'python'
        ]
        for venv_py in candidates:
            if venv_py.exists() and str(venv_py) != sys.executable:
                os.execv(str(venv_py), [str(venv_py)] + sys.argv)

        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
