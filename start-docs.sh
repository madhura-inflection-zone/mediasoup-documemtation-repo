#!/bin/bash

# MediaSoup Video Conferencing Service Documentation Server
# This script starts the Docsify documentation server

echo "🚀 Starting MediaSoup Video Conferencing Service Documentation"
echo "=============================================================="

# Check if docsify-cli is installed
if ! command -v docsify &> /dev/null; then
    echo "📦 Installing docsify-cli..."
    npm install -g docsify-cli
fi

# Check if docs directory exists
if [ ! -d "docs" ]; then
    echo "❌ Error: docs directory not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

# Check if docsify is installed
if ! command -v docsify &> /dev/null; then
    echo "❌ Error: docsify-cli installation failed!"
    echo "Please install it manually: npm install -g docsify-cli"
    exit 1
fi

echo "✅ docsify-cli is installed"
echo "📖 Starting documentation server..."
echo ""
echo "🌐 Documentation will be available at: http://localhost:3000"
echo "📱 You can also access it on your local network"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start docsify server
docsify serve docs 3000 