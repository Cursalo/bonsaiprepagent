#!/bin/bash

# Bonsai Desktop App Setup Script
echo "🌱 Setting up Bonsai Desktop App..."

# Check if user wants Electron or Tauri
echo ""
echo "Choose your desktop framework:"
echo "1) Tauri (Recommended - 3MB, fast, secure)"
echo "2) Electron (Easier setup - 120MB, more compatible)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🦀 Setting up Tauri..."
    
    # Check if Rust is installed
    if ! command -v rustc &> /dev/null; then
        echo "📦 Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
        source ~/.cargo/env
    else
        echo "✅ Rust already installed"
    fi
    
    # Install Tauri CLI
    echo "📦 Installing Tauri CLI..."
    npm install --save-dev @tauri-apps/cli
    
    # Initialize Tauri
    echo "🔧 Initializing Tauri..."
    npx tauri init --yes
    
    # Update package.json with Tauri scripts
    echo "📝 Adding Tauri scripts to package.json..."
    npm pkg set scripts.tauri="tauri"
    npm pkg set scripts.tauri:dev="tauri dev"
    npm pkg set scripts.tauri:build="tauri build"
    
    echo ""
    echo "✅ Tauri setup complete!"
    echo "🚀 To start development: npm run tauri:dev"
    echo "📦 To build for production: npm run tauri:build"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "⚡ Setting up Electron..."
    
    # Install Electron dependencies
    echo "📦 Installing Electron dependencies..."
    npm install --save-dev electron electron-builder concurrently wait-on cross-env
    
    # Create Electron main file
    echo "📄 Creating Electron configuration files..."
    
    # Create public/electron.js
    cat > public/electron.js << 'EOL'
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    show: false
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);
  mainWindow.once('ready-to-show', () => mainWindow.show());
  
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
EOL

    # Update package.json
    echo "📝 Adding Electron scripts to package.json..."
    npm pkg set main="public/electron.js"
    npm pkg set homepage="./"
    npm pkg set scripts.electron="wait-on tcp:3000 && electron ."
    npm pkg set scripts.electron:dev="concurrently \"npm run dev\" \"npm run electron\""
    npm pkg set scripts.electron:build="next build && next export && electron-builder"
    
    echo ""
    echo "✅ Electron setup complete!"
    echo "🚀 To start development: npm run electron:dev"
    echo "📦 To build for production: npm run electron:build"
    
else
    echo "❌ Invalid choice. Please run the script again."
    exit 1
fi

echo ""
echo "📚 Next steps:"
echo "1. Read DESKTOP_APP_DEPLOYMENT.md for detailed instructions"
echo "2. Create app icons (see guide for specifications)"
echo "3. Test your desktop app in development mode"
echo "4. Build and distribute your app"
echo ""
echo "🎉 Your AI assistant is ready to become a desktop app!"