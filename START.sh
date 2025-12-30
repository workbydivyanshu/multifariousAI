#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    MultifariousAI                            ║"
echo "║          Free Multi-AI Chat Platform                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Ubuntu: sudo apt install nodejs npm"
    echo "  - Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 First time setup - Installing dependencies..."
    echo "This may take 2-3 minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "⚠️ Trying with legacy peer deps..."
        npm install --legacy-peer-deps
    fi
    echo ""
    echo "✓ Dependencies installed!"
    echo ""
fi

echo "🚀 Starting MultifariousAI..."
echo ""
echo "════════════════════════════════════════════════════════════════"
echo " The app will be available at: http://localhost:3000"
echo ""
echo " Press Ctrl+C to stop the server."
echo "════════════════════════════════════════════════════════════════"
echo ""

# Open browser after a delay (macOS/Linux)
(sleep 5 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null)) &

# Run the dev server
npm run dev
