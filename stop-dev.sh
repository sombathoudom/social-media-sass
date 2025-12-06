#!/bin/bash

# Stop all development services

echo "🛑 Stopping Laravel Development Services..."
echo ""

# Check if tmux session exists
if tmux has-session -t laravel-dev 2>/dev/null; then
    echo "Stopping tmux session..."
    tmux kill-session -t laravel-dev
    echo "✅ Tmux session stopped"
fi

# Check for background processes
if [ -f .dev-pids ]; then
    echo "Stopping background processes..."
    while read -r pid; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
            echo "✅ Stopped process $pid"
        fi
    done < .dev-pids
    rm .dev-pids
fi

# Kill any remaining processes on common ports
echo ""
echo "Checking for processes on common ports..."

# Port 8080 (Reverb)
REVERB_PID=$(lsof -ti:8080)
if [ ! -z "$REVERB_PID" ]; then
    kill $REVERB_PID 2>/dev/null
    echo "✅ Stopped Reverb (port 8080)"
fi

# Port 8000 (Laravel)
SERVER_PID=$(lsof -ti:8000)
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    echo "✅ Stopped Laravel Server (port 8000)"
fi

# Port 5173 (Vite)
VITE_PID=$(lsof -ti:5173)
if [ ! -z "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null
    echo "✅ Stopped Vite (port 5173)"
fi

echo ""
echo "✨ All services stopped!"
