#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "          LOCAL CODER - Offline Multi-Language IDE        "
echo "=========================================================="

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install django djangorestframework django-cors-headers
fi

# Run backend migrations
echo "Verifying database migrations..."
cd backend
python manage.py migrate --noinput
cd ..

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend offline assets..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo ""
echo "Starting LOCAL CODER Server at http://127.0.0.1:8000"
echo "Press Ctrl+C to stop the application."
echo "=========================================================="

cd backend
python manage.py runserver 127.0.0.1:8000

