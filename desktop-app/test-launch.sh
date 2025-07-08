#!/bin/bash

echo "🧪 Testing Bonsai SAT Assistant Launch"
echo "======================================"

# Kill any running instances
echo "🔄 Stopping any running instances..."
pkill -f "Bonsai SAT Assistant" || true
sleep 2

# Create log directory if it doesn't exist
LOG_DIR="$HOME/Library/Logs/Bonsai SAT Assistant"
mkdir -p "$LOG_DIR"

echo "📁 Log directory: $LOG_DIR"

# Launch the app
echo "🚀 Launching Bonsai SAT Assistant..."
open -a "Bonsai SAT Assistant"

# Wait a bit for startup
echo "⏳ Waiting for app to start..."
sleep 3

# Check if app is running
if pgrep -f "Bonsai SAT Assistant" > /dev/null; then
    echo "✅ App is running!"
    
    # Wait for log file to be created
    echo "📝 Waiting for logs..."
    sleep 2
    
    # Check for log files
    if [ -f "$LOG_DIR/app.log" ]; then
        echo "✅ Log file created successfully!"
        echo ""
        echo "📖 Recent log entries:"
        echo "======================"
        tail -10 "$LOG_DIR/app.log"
    else
        echo "⚠️ Log file not found yet"
    fi
    
    if [ -f "$LOG_DIR/errors.log" ]; then
        echo ""
        echo "❌ Error log found - checking for issues:"
        echo "========================================="
        tail -5 "$LOG_DIR/errors.log"
    else
        echo ""
        echo "✅ No error log found (good!)"
    fi
    
else
    echo "❌ App failed to start or crashed"
    echo ""
    echo "🔍 Checking for crash reports..."
    
    # Check for recent crash reports
    CRASH_REPORTS=$(ls -t ~/Library/Logs/DiagnosticReports/ | grep -i "bonsai\|electron" | head -1)
    if [ -n "$CRASH_REPORTS" ]; then
        echo "💥 Found recent crash report: $CRASH_REPORTS"
        echo "Run this to view: open ~/Library/Logs/DiagnosticReports/"
    else
        echo "No recent crash reports found"
    fi
fi

echo ""
echo "🔧 Useful commands:"
echo "   View logs: tail -f '$LOG_DIR/app.log'"
echo "   Stop app: pkill -f 'Bonsai SAT Assistant'"
echo "   Restart: open -a 'Bonsai SAT Assistant'"
echo ""