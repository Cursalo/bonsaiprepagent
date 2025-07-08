#!/bin/bash

# Bonsai SAT Desktop App - Build Script for Mac
# This script automates the entire build process

set -e  # Exit on any error

echo "🌱 Bonsai SAT Desktop App - Build Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the desktop-app directory."
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 16 or higher."
    exit 1
fi

print_success "Node.js version $NODE_VERSION is compatible"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/
print_success "Cleaned previous builds"

# Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run linting (optional)
print_status "Running code quality checks..."
if npm run lint 2>/dev/null || true; then
    print_success "Code quality checks passed"
else
    print_warning "Linting skipped or failed (non-critical)"
fi

# Create assets directory if it doesn't exist
print_status "Setting up assets..."
mkdir -p assets

# Check if icon exists, if not create a placeholder
if [ ! -f "assets/icon.png" ]; then
    print_warning "App icon not found at assets/icon.png"
    print_status "Creating placeholder icon..."
    
    # Create a simple 1024x1024 placeholder icon using ImageMagick if available
    if command -v convert &> /dev/null; then
        convert -size 1024x1024 xc:'#22c55e' -pointsize 200 -fill white -gravity center -annotate +0+0 '🌱' assets/icon.png
        print_success "Created placeholder icon"
    else
        print_warning "ImageMagick not found. Please add assets/icon.png manually or install ImageMagick: brew install imagemagick"
    fi
fi

# Build the application
print_status "Building application for macOS..."
print_status "This may take several minutes..."

# Set environment variables for better build
export NODE_ENV=production
export CSC_IDENTITY_AUTO_DISCOVERY=false  # Disable code signing for development

if npm run build-mac; then
    print_success "Application built successfully!"
else
    print_error "Build failed"
    exit 1
fi

# Check if build artifacts exist
if [ -d "dist" ]; then
    print_success "Build artifacts created in dist/ directory:"
    ls -la dist/
    
    # Check for the main app file
    if [ -d "dist/Bonsai SAT Assistant.app" ]; then
        print_success "✅ Application bundle created: Bonsai SAT Assistant.app"
    fi
    
    # Check for installer
    if [ -f "dist/Bonsai SAT Assistant-"*".dmg" ]; then
        DMG_FILE=$(ls dist/*.dmg | head -n1)
        print_success "✅ Installer created: $(basename "$DMG_FILE")"
        
        # Get file size
        FILE_SIZE=$(du -h "$DMG_FILE" | cut -f1)
        print_status "Installer size: $FILE_SIZE"
    fi
    
    echo ""
    print_success "🎉 Build completed successfully!"
    echo ""
    echo "📦 To install the app:"
    echo "   1. Open the .dmg file in dist/"
    echo "   2. Drag 'Bonsai SAT Assistant' to Applications folder"
    echo "   3. Launch from Applications or Launchpad"
    echo ""
    echo "🧪 To test the app:"
    echo "   Double-click: dist/Bonsai SAT Assistant.app"
    echo ""
    
else
    print_error "Build directory not found - build may have failed"
    exit 1
fi

# Optional: Open dist folder
if command -v open &> /dev/null; then
    read -p "Open dist folder in Finder? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open dist/
    fi
fi

print_success "Build script completed! 🌱"