# 🚀 Bonsai SAT Desktop App - Build Instructions for Mac

## Prerequisites

### 1. Install Node.js
```bash
# Install Node.js (version 16 or higher)
# Download from https://nodejs.org or use Homebrew:
brew install node

# Verify installation
node --version  # Should be 16+
npm --version   # Should be 8+
```

### 2. Install Xcode Command Line Tools (for Mac builds)
```bash
xcode-select --install
```

## Quick Build Process

### Step 1: Navigate to the desktop app directory
```bash
cd "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app"
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Build the app
```bash
# For Mac (creates .dmg installer)
npm run build-mac

# Or for universal build (Intel + Apple Silicon)
npm run build
```

## Detailed Build Steps

### 1. **Prepare the Environment**
```bash
# Navigate to desktop app folder
cd "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app"

# Verify you're in the right directory
ls -la
# You should see: package.json, src/, assets/, etc.
```

### 2. **Install All Dependencies**
```bash
# Install main dependencies
npm install

# This will install:
# - Electron (desktop app framework)
# - electron-builder (for creating installers)
# - tesseract.js (OCR for reading questions)
# - Other required packages
```

### 3. **Create App Icons (Optional)**
```bash
# Create assets directory if it doesn't exist
mkdir -p assets

# Add your app icon (1024x1024 PNG recommended)
# Save as: assets/icon.png
# The build process will automatically create all required sizes
```

### 4. **Test in Development Mode**
```bash
# Run the app in development mode first
npm run dev

# This will:
# - Launch the desktop app
# - Open developer tools
# - Allow hot reloading for testing
```

### 5. **Build for Production**
```bash
# Build for Mac (creates both Intel and Apple Silicon versions)
npm run build-mac

# The build process will:
# 1. Bundle all code and dependencies
# 2. Create the .app file
# 3. Generate a .dmg installer
# 4. Sign the app (if you have developer certificates)
```

### 6. **Find Your Built App**
```bash
# Built files will be in the dist/ directory
ls -la dist/

# You'll find:
# - Bonsai SAT Assistant.app (the actual app)
# - Bonsai SAT Assistant-1.0.0.dmg (installer)
# - Various other build artifacts
```

## Build Commands Reference

```bash
# Development
npm run dev          # Run in development mode with dev tools

# Building
npm run build        # Build for current platform
npm run build-mac    # Build specifically for macOS
npm run build-win    # Build for Windows (if needed)
npm run pack         # Create unpacked app (for testing)

# Testing
npm test            # Run unit tests
npm run lint        # Check code quality

# Utilities
npm run postinstall # Rebuild native dependencies
```

## Troubleshooting

### Common Issues and Solutions

#### **1. "electron-builder" not found**
```bash
# Solution: Install electron-builder globally
npm install -g electron-builder

# Or use npx
npx electron-builder --mac
```

#### **2. Native dependencies issues**
```bash
# Solution: Rebuild native modules
npm run postinstall

# Or manually rebuild
npx electron-rebuild
```

#### **3. Permission errors during build**
```bash
# Solution: Fix permissions
sudo chown -R $(whoami) node_modules
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### **4. "Code signing failed" (Mac)**
```bash
# For development/testing, disable code signing:
# Add to package.json build.mac section:
"identity": null

# Or set environment variable:
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run build-mac
```

#### **5. OCR libraries not working**
```bash
# Tesseract.js might need additional setup
npm install tesseract.js@latest

# Or try alternative installation:
npm uninstall tesseract.js
npm install tesseract.js@4.1.4
```

## Advanced Configuration

### Custom Build Settings

Edit `package.json` build section for custom configurations:

```json
{
  "build": {
    "appId": "com.bonsai.sat-assistant",
    "productName": "Bonsai SAT Assistant",
    "mac": {
      "category": "public.app-category.education",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "identity": null,
      "gatekeeperAssess": false
    }
  }
}
```

### Environment Variables

Create `.env` file for configuration:
```bash
# .env file
NODE_ENV=production
ELECTRON_DEV=false
```

## Testing the Built App

### 1. **Test the .app file**
```bash
# Navigate to dist folder
cd dist

# Run the app directly
open "Bonsai SAT Assistant.app"
```

### 2. **Test the installer**
```bash
# Mount the DMG
open "Bonsai SAT Assistant-1.0.0.dmg"

# Drag the app to Applications folder
# Launch from Applications
```

### 3. **Verify functionality**
- App launches without errors
- System tray icon appears
- Settings can be configured
- Monitoring can be started/stopped
- OCR functionality works (test with sample images)

## Distribution

### For Testing/Development
- Share the `.dmg` file directly
- Recipients can install by dragging to Applications

### For Production
- Sign the app with Apple Developer certificate
- Notarize for macOS Gatekeeper
- Distribute through Mac App Store or direct download

## File Structure After Build

```
dist/
├── Bonsai SAT Assistant.app/           # The actual application
├── Bonsai SAT Assistant-1.0.0.dmg     # Installer for distribution
├── Bonsai SAT Assistant-1.0.0-mac.zip # Zipped app
├── builder-debug.yml                   # Build debug info
└── latest-mac.yml                      # Update server info
```

## Performance Optimization

### Reduce Bundle Size
```bash
# Analyze bundle size
npm run build -- --publish=never --debug

# Remove unnecessary dependencies
npm uninstall <unused-package>

# Use production builds
NODE_ENV=production npm run build
```

### Improve Startup Time
- Lazy load heavy dependencies
- Optimize image assets
- Minimize main process work

## Security Considerations

### Code Signing (Production)
```bash
# Get Apple Developer Certificate
# Add to package.json:
"afterSign": "scripts/notarize.js",
"mac": {
  "hardenedRuntime": true,
  "entitlements": "assets/entitlements.mac.plist"
}
```

### Notarization (Production)
Required for macOS 10.15+ distribution outside Mac App Store.

## Next Steps After Building

1. **Test thoroughly** on different Mac versions
2. **Create installer automation** for updates
3. **Set up code signing** for production
4. **Implement auto-updater** for seamless updates
5. **Create documentation** for end users

## Support

If you encounter issues during the build process:

1. **Check the build logs** in the terminal
2. **Verify all dependencies** are correctly installed
3. **Try a clean build**: `rm -rf node_modules && npm install && npm run build`
4. **Check GitHub issues** for similar problems
5. **Contact support** with specific error messages

---

**Ready to build? Run these commands:**

```bash
cd "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app"
npm install
npm run build-mac
```

Your Bonsai SAT Desktop App will be ready in the `dist/` folder! 🌱