#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "          LOCAL CODER - Development Mode (Hot Reload)     "
echo "=========================================================="

source venv/bin/activate

# Trap to kill background jobs on exit
cleanup() {
    echo ""
    echo "Stopping LOCAL CODER servers..."
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start Django Backend
echo "Starting Django Backend on http://127.0.0.1:8000 ..."
cd backend
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!
cd ..

# Start Vite Frontend
echo "Starting Vite Dev Server on http://localhost:5173 ..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "-> IDE Application: http://localhost:5173"
echo "-> Backend API:     http://127.0.0.1:8000"
echo "Press Ctrl+C to terminate both servers."
echo "=========================================================="

wait

