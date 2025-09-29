#!/bin/bash

# Start WebSocket server in background
echo "🚀 Starting WebSocket server..."
npm run ai-reactions:dev &
WS_PID=$!

# Wait a moment for WebSocket server to start
sleep 3

# Start Next.js development server
echo "🚀 Starting Next.js development server..."
npm run dev &
NEXT_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $WS_PID 2>/dev/null
    kill $NEXT_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

echo "✅ Both servers are running!"
echo "📱 Next.js: http://localhost:3000"
echo "🔌 WebSocket: ws://localhost:3000/ws"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
