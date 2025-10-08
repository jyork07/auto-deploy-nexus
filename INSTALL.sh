#!/bin/bash

echo "========================================"
echo "ViraPilot v2.0 - Installation"
echo "========================================"
echo ""

echo "[1/3] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

node --version
echo "Node.js found!"
echo ""

echo "[2/3] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo ""

echo "[3/3] Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo ""
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "For production build:"
echo "  npm run preview"
echo ""
echo "See SETUP.md for API key configuration"
echo ""
