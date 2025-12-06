#!/bin/bash

# Laravel Reverb Development Startup Script
# This script starts all required services for development

echo "🚀 Starting Laravel Reverb Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${YELLOW}⚠️  tmux is not installed. Installing services in background...${NC}"
    echo ""
    
    # Start services in background
    echo -e "${BLUE}Starting Reverb Server...${NC}"
    php artisan reverb:start > storage/logs/reverb.log 2>&1 &
    REVERB_PID=$!
    echo "✅ Reverb started (PID: $REVERB_PID)"
    
    echo -e "${BLUE}Starting Queue Worker...${NC}"
    php artisan queue:work > storage/logs/queue.log 2>&1 &
    QUEUE_PID=$!
    echo "✅ Queue Worker started (PID: $QUEUE_PID)"
    
    echo -e "${BLUE}Starting Laravel Server...${NC}"
    php artisan serve > storage/logs/server.log 2>&1 &
    SERVER_PID=$!
    echo "✅ Laravel Server started (PID: $SERVER_PID)"
    
    echo -e "${BLUE}Starting Vite Dev Server...${NC}"
    npm run dev > storage/logs/vite.log 2>&1 &
    VITE_PID=$!
    echo "✅ Vite started (PID: $VITE_PID)"
    
    echo ""
    echo -e "${GREEN}✨ All services started!${NC}"
    echo ""
    echo "📝 Process IDs saved to .dev-pids"
    echo "$REVERB_PID $QUEUE_PID $SERVER_PID $VITE_PID" > .dev-pids
    echo ""
    echo "To stop all services, run: ./stop-dev.sh"
    echo ""
    echo "📊 View logs:"
    echo "  Reverb:  tail -f storage/logs/reverb.log"
    echo "  Queue:   tail -f storage/logs/queue.log"
    echo "  Server:  tail -f storage/logs/server.log"
    echo "  Vite:    tail -f storage/logs/vite.log"
    echo ""
    
else
    # Use tmux for better management
    echo -e "${BLUE}Starting services in tmux session 'laravel-dev'...${NC}"
    echo ""
    
    # Create new tmux session
    tmux new-session -d -s laravel-dev
    
    # Split into 4 panes
    tmux split-window -h -t laravel-dev
    tmux split-window -v -t laravel-dev:0.0
    tmux split-window -v -t laravel-dev:0.2
    
    # Start services in each pane
    tmux send-keys -t laravel-dev:0.0 'php artisan reverb:start' C-m
    tmux send-keys -t laravel-dev:0.1 'php artisan queue:work' C-m
    tmux send-keys -t laravel-dev:0.2 'php artisan serve' C-m
    tmux send-keys -t laravel-dev:0.3 'npm run dev' C-m
    
    echo -e "${GREEN}✨ All services started in tmux!${NC}"
    echo ""
    echo "To view the tmux session:"
    echo "  tmux attach -t laravel-dev"
    echo ""
    echo "To detach from tmux: Press Ctrl+B then D"
    echo ""
    echo "To stop all services:"
    echo "  tmux kill-session -t laravel-dev"
    echo "  or run: ./stop-dev.sh"
    echo ""
    
    # Attach to the session
    tmux attach -t laravel-dev
fi
