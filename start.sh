#!/bin/bash

# Hirshfeld Charge Database Viewer - Startup Script
# This script starts the Flask web application

PYTHON_PATH="/Users/limusen/app/anaconda3/bin/python"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$APP_DIR"

echo "🚀 Starting Hirshfeld Charge Database Viewer..."
echo "📂 Working directory: $APP_DIR"
echo "🐍 Python: $PYTHON_PATH"
echo ""
echo "🌐 Server will start at: http://127.0.0.1:5000"
echo "📊 Database: data/h.db (5080 entries)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

$PYTHON_PATH app.py
