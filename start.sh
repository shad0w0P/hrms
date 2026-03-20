#!/bin/bash
# Start both HRMS Backend and Frontend

echo "═══════════════════════════════════════"
echo "         HRMS Lite - Full Stack        "
echo "═══════════════════════════════════════"

# Start backend in background
echo ""
echo "▶  Starting Backend (FastAPI)..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 2

# Start frontend
echo "▶  Starting Frontend (React)..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Backend  → http://localhost:8000"
echo "  ✅ Frontend → http://localhost:5173"
echo "  📖 API Docs → http://localhost:8000/docs"
echo "═══════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap Ctrl+C and kill both
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
