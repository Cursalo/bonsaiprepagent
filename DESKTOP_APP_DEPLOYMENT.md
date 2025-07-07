# 🖥️ Bonsai Desktop App Deployment Guide

## 🎯 Quick Decision: Electron vs Tauri

**Recommended: Tauri** for Bonsai AI Assistant
- ✅ **3MB** app size vs Electron's 120MB+
- ✅ **30MB RAM** usage vs Electron's 100MB+
- ✅ **Better security** for AI processing
- ✅ **Faster startup** time
- ✅ **Native performance** for AI computations

---

## 🚀 Option 1: Electron Desktop App (Easier Setup)

### Step 1: Install Dependencies
```bash
cd bonsai-sat-tutor
npm install --save-dev electron electron-builder concurrently wait-on
npm install --save-dev cross-env
```

### Step 2: Create Electron Entry Point
Create `public/electron.js`:
```javascript
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
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create application menu
const template = [
  {
    label: 'Bonsai',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
```

### Step 3: Create Preload Script
Create `public/preload.js`:
```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  platform: process.platform,
  versions: process.versions
});
```

### Step 4: Update Package.json
```json
{
  "main": "public/electron.js",
  "homepage": "./",
  "scripts": {
    "electron": "wait-on tcp:3000 && electron .",
    "electron-dev": "concurrently \"npm run dev\" \"npm run electron\"",
    "electron-build": "next build && next export && electron-builder",
    "electron-dist": "npm run build && electron-builder --publish=never"
  },
  "build": {
    "appId": "com.bonsai.sat-tutor",
    "productName": "Bonsai SAT Tutor",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*",
      "public/electron.js",
      "public/preload.js",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.education",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        }
      ]
    }
  }
}
```

### Step 5: Update Next.js Config
Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
}

module.exports = nextConfig
```

### Step 6: Build and Test
```bash
# Development
npm run electron-dev

# Production build
npm run electron-build
```

---

## ⚡ Option 2: Tauri Desktop App (Recommended)

### Step 1: Install Rust and Tauri
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
npm install --save-dev @tauri-apps/cli
```

### Step 2: Initialize Tauri
```bash
npm run tauri init
```

### Step 3: Configure Tauri
Update `src-tauri/tauri.conf.json`:
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:3000",
    "distDir": "../out"
  },
  "package": {
    "productName": "Bonsai SAT Tutor",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "show": true,
        "maximize": true,
        "minimize": true,
        "unmaximize": true,
        "unminimize": true,
        "startDragging": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Education",
      "copyright": "",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.bonsai.sat-tutor",
      "longDescription": "",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 900,
        "resizable": true,
        "title": "Bonsai SAT Tutor",
        "width": 1400,
        "minHeight": 600,
        "minWidth": 800
      }
    ]
  }
}
```

### Step 4: Update Package.json Scripts
```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Step 5: Build and Test
```bash
# Development
npm run tauri:dev

# Production build
npm run tauri:build
```

---

## 📦 Distribution Strategy

### 1. Direct Download (Easiest)
- Host `.dmg` and `.exe` files on your website
- Users download and install manually
- No app store approval needed

### 2. Mac App Store
- **Requirements**: Apple Developer Account ($99/year)
- **Process**: Code signing + notarization + review
- **Timeline**: 2-7 days review
- **Benefits**: Trusted installation, automatic updates

### 3. Microsoft Store
- **Requirements**: Microsoft Developer Account ($19/year)
- **Process**: MSIX packaging + certification
- **Timeline**: 1-3 days review
- **Benefits**: Trusted installation, automatic updates

### 4. Alternative Stores
- **Homebrew** (Mac): `brew install --cask bonsai-sat-tutor`
- **Chocolatey** (Windows): `choco install bonsai-sat-tutor`
- **Winget** (Windows): `winget install BonsaiSATTutor`

---

## 🎨 Required Assets for Desktop App

### Icons Needed:
```
📁 Desktop App Icons:
├── icon.icns (Mac - 512x512)
├── icon.ico (Windows - 256x256)
├── icon.png (Linux - 512x512)
├── 32x32.png
├── 128x128.png
└── 256x256.png
```

### App Screenshots:
- Main interface in action
- AI assistant helping with SAT problems
- Progress tracking dashboard
- Settings/preferences screen

---

## 🚀 Quick Start Commands

### For Electron:
```bash
# 1. Install dependencies
npm install --save-dev electron electron-builder concurrently wait-on

# 2. Add scripts to package.json (see above)

# 3. Create electron.js and preload.js files

# 4. Test in development
npm run electron-dev

# 5. Build for production
npm run electron-build
```

### For Tauri (Recommended):
```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Tauri CLI
npm install --save-dev @tauri-apps/cli

# 3. Initialize Tauri
npm run tauri init

# 4. Test in development
npm run tauri:dev

# 5. Build for production
npm run tauri:build
```

---

## 💡 Pro Tips

1. **Start with Tauri** - Better performance and smaller size
2. **Create icons early** - Use a service like [IconKitchen](https://icon.kitchen/)
3. **Test thoroughly** - Both development and production builds
4. **Plan distribution** - Direct download is fastest to market
5. **Consider auto-updates** - Essential for AI apps that improve over time

---

## 🎯 Recommended Deployment Path

1. **Week 1**: Set up Tauri development environment
2. **Week 2**: Create and test desktop build
3. **Week 3**: Create icons and prepare distribution
4. **Week 4**: Deploy direct download version
5. **Week 5+**: Submit to app stores if desired

**Result**: Professional desktop AI assistant that users can install like any native application! 🚀

Your Bonsai SAT Tutor will feel like a native desktop app while leveraging all your existing web technologies.