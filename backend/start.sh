#!/bin/bash
# Start HRMS Backend (FastAPI)

cd "$(dirname "$0")"

echo "🚀 Starting HRMS Backend..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.9+"
    exit 1
fi

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

# Start server
echo "✅ Backend running at http://localhost:8000"
echo "📖 API Docs at http://localhost:8000/docs"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
