#!/bin/bash

# Bonsai SAT Desktop App - Installation Test Script
# This script helps test and debug the installation process

set -e

echo "🧪 Bonsai SAT Desktop - Installation Test"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test 1: Check if DMG files exist
print_status "Checking DMG installer files..."

DMG_ARM64="dist/Bonsai SAT Assistant-1.0.0-arm64.dmg"
DMG_INTEL="dist/Bonsai SAT Assistant-1.0.0.dmg"

if [ -f "$DMG_ARM64" ]; then
    SIZE_ARM64=$(du -h "$DMG_ARM64" | cut -f1)
    print_success "ARM64 DMG found: $DMG_ARM64 ($SIZE_ARM64)"
else
    print_error "ARM64 DMG not found: $DMG_ARM64"
fi

if [ -f "$DMG_INTEL" ]; then
    SIZE_INTEL=$(du -h "$DMG_INTEL" | cut -f1)
    print_success "Intel DMG found: $DMG_INTEL ($SIZE_INTEL)"
else
    print_error "Intel DMG not found: $DMG_INTEL"
fi

# Test 2: Check if app is already installed
print_status "Checking current installation..."

APP_PATH="/Applications/Bonsai SAT Assistant.app"
if [ -d "$APP_PATH" ]; then
    print_warning "App already installed at: $APP_PATH"
    
    # Check if it's running
    if pgrep -f "Bonsai SAT Assistant" > /dev/null; then
        print_warning "App is currently running"
    else
        print_status "App is not running"
    fi
else
    print_status "App not yet installed"
fi

# Test 3: Check log directory
print_status "Checking log directory..."

LOG_DIR="$HOME/Library/Logs/Bonsai SAT Assistant"
if [ -d "$LOG_DIR" ]; then
    print_success "Log directory exists: $LOG_DIR"
    
    if [ -f "$LOG_DIR/app.log" ]; then
        LOG_SIZE=$(du -h "$LOG_DIR/app.log" | cut -f1)
        print_success "Main log file exists: app.log ($LOG_SIZE)"
        
        # Show last few lines of log
        print_status "Recent log entries:"
        tail -5 "$LOG_DIR/app.log" | while read line; do
            echo "  $line"
        done
    else
        print_warning "Main log file not found"
    fi
    
    if [ -f "$LOG_DIR/errors.log" ]; then
        ERROR_SIZE=$(du -h "$LOG_DIR/errors.log" | cut -f1)
        print_warning "Error log file exists: errors.log ($ERROR_SIZE)"
        
        # Show recent errors
        print_status "Recent errors:"
        tail -3 "$LOG_DIR/errors.log" | while read line; do
            echo "  $line"
        done
    else
        print_success "No error log (good!)"
    fi
else
    print_status "Log directory not yet created"
fi

# Test 4: System requirements
print_status "Checking system requirements..."

# Check macOS version
MACOS_VERSION=$(sw_vers -productVersion)
print_status "macOS version: $MACOS_VERSION"

# Check architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    print_success "Apple Silicon Mac detected - use ARM64 DMG"
    RECOMMENDED_DMG="$DMG_ARM64"
elif [ "$ARCH" = "x86_64" ]; then
    print_success "Intel Mac detected - use Intel DMG"
    RECOMMENDED_DMG="$DMG_INTEL"
else
    print_warning "Unknown architecture: $ARCH"
fi

# Check Node.js (for development)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js available: $NODE_VERSION"
else
    print_status "Node.js not found (not needed for installed app)"
fi

# Test 5: Installation test
print_status "Testing installation process..."

if [ -n "$RECOMMENDED_DMG" ] && [ -f "$RECOMMENDED_DMG" ]; then
    print_success "Recommended installer: $RECOMMENDED_DMG"
    
    # Test if DMG can be mounted
    print_status "Testing DMG file integrity..."
    if hdiutil verify "$RECOMMENDED_DMG" &>/dev/null; then
        print_success "DMG file is valid and can be mounted"
    else
        print_error "DMG file appears to be corrupted"
    fi
    
    echo ""
    print_status "🚀 Installation Instructions:"
    echo "   1. Run: open \"$RECOMMENDED_DMG\""
    echo "   2. Drag 'Bonsai SAT Assistant' to Applications folder"
    echo "   3. Launch from Applications or run test again"
    echo ""
    
    # Offer to open DMG
    read -p "Open the DMG installer now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Opening DMG installer..."
        open "$RECOMMENDED_DMG"
        print_success "DMG opened - follow the installation instructions above"
    fi
else
    print_error "No valid DMG file found for your system"
fi

# Test 6: Development mode test
echo ""
print_status "Development mode test..."
if [ -f "package.json" ] && [ -d "node_modules" ]; then
    print_success "Development environment ready"
    
    read -p "Test app in development mode? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting development mode..."
        npm run dev &
        DEV_PID=$!
        
        sleep 5
        
        if ps -p $DEV_PID > /dev/null; then
            print_success "App running in development mode (PID: $DEV_PID)"
            
            read -p "Stop development mode? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill $DEV_PID
                print_status "Development mode stopped"
            fi
        else
            print_error "Failed to start in development mode"
        fi
    fi
else
    print_status "Development environment not available (normal for end users)"
fi

echo ""
print_success "Installation test completed!"
print_status "For troubleshooting, check the logs at: $LOG_DIR"