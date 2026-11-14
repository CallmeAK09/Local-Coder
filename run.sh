#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# ---------------------------------------------------------
# PWA Launcher Mode (Triggered when clicking the PWA icon)
# ---------------------------------------------------------
if [ "$1" = "--pwa" ]; then
    # 1. Clean or trim log file if already reached 100 lines
    if [ -f "$DIR/backend/server.log" ]; then
        line_count=$(wc -l < "$DIR/backend/server.log" 2>/dev/null || echo 0)
        if [ "$line_count" -ge 100 ]; then
            rm -f "$DIR/backend/server.log"
        fi
    fi

    # 2. Start server in background if not already active
    if ! curl -s -m 1 http://127.0.0.1:8000/api/dependencies/status/ >/dev/null 2>&1; then
        nohup bash -c 'exec "$1" "$2" runserver 127.0.0.1:8000 2>&1 | exec "$1" -u "$3" "$4" 100' \
            bash "$DIR/venv/bin/python" "$DIR/backend/manage.py" "$DIR/backend/log_manager.py" "$DIR/backend/server.log" </dev/null >/dev/null 2>&1 &
        disown

        for i in {1..15}; do
            if curl -s -m 1 http://127.0.0.1:8000/api/dependencies/status/ >/dev/null 2>&1; then
                break
            fi
            sleep 1
        done
    fi

    # 3. Open Chrome PWA window
    if [ -x "/opt/google/chrome/google-chrome" ]; then
        /opt/google/chrome/google-chrome --profile-directory=Default --app-id=mngloiodpbedloingimookgdhhkgcblo >/dev/null 2>&1 &
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome --app=http://localhost:8000 >/dev/null 2>&1 &
    elif command -v chromium-browser >/dev/null 2>&1; then
        chromium-browser --app=http://localhost:8000 >/dev/null 2>&1 &
    else
        xdg-open "http://localhost:8000" >/dev/null 2>&1 &
    fi
    exit 0
fi

# ---------------------------------------------------------
# Standard Server Run Mode: ./run.sh
# ---------------------------------------------------------
echo "=========================================================="
echo "          LOCAL CODER - Offline Multi-Language IDE        "
echo "=========================================================="

# 1. Setup Virtual Environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "[SETUP] Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install django djangorestframework django-cors-headers
fi

# 2. Database Migrations
echo "[SETUP] Verifying database..."
python backend/manage.py migrate --noinput >/dev/null 2>&1

# 3. Build Frontend if missing
if [ ! -d "frontend/dist" ]; then
    echo "[SETUP] Building offline frontend assets..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# 4. Limit or remove server.log if reached 100 lines
if [ -f "backend/server.log" ]; then
    line_count=$(wc -l < "backend/server.log" 2>/dev/null || echo 0)
    if [ "$line_count" -ge 100 ]; then
        rm -f "backend/server.log"
    fi
fi

# 5. Hook any existing Chrome PWA desktop launchers
python -c "
import sys
sys.path.append('$DIR/backend')
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from config.lifecycle import sync_pwa_launchers
sync_pwa_launchers()
" >/dev/null 2>&1 || true

echo ""
echo "=========================================================="
echo "🚀 LOCAL CODER Server Running at: http://127.0.0.1:8000"
echo ""
echo "💡 TO INSTALL AS PWA:"
echo "   1. Open http://localhost:8000 in Chrome or Edge"
echo "   2. Click 'Install Local Compiler' in the browser address bar"
echo "   3. From then on, simply click the PWA icon to open!"
echo "      (Environment & server will auto-start and auto-stop)"
echo "=========================================================="
echo ""

# Run server with 100-line log limiter
exec python backend/manage.py runserver 127.0.0.1:8000 2>&1 | python -u backend/log_manager.py backend/server.log 100
