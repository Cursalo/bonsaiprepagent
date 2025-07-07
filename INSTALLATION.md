# Bonsai SAT Tutor - Installation & Distribution Guide

## Multi-Platform Distribution Strategy

Bonsai SAT Tutor is designed for maximum accessibility across all student devices and study environments. Our distribution strategy includes web applications, browser extensions, desktop applications, and future mobile apps to ensure students can access their AI tutor wherever they study.

## Installation Methods Overview

### 1. Web Application (Primary Platform)
**Target Audience**: All users, primary onboarding experience
**URL**: https://bonsai-sat-tutor.vercel.app
**Features**: Full feature set, responsive design, PWA capabilities

### 2. Browser Extension (Core Experience)
**Target Audience**: Students using College Board Bluebook, Khan Academy
**Platforms**: Chrome, Firefox, Safari, Edge
**Features**: Contextual overlay, seamless integration with SAT platforms

### 3. Desktop Application (Power Users)
**Target Audience**: Pro and Enterprise subscribers
**Platforms**: macOS, Windows, Linux (Electron-based)
**Features**: Native OS integration, offline capabilities, enhanced performance

### 4. Mobile Applications (Future Release)
**Target Audience**: Students studying on tablets and smartphones
**Platforms**: iOS, Android (React Native)
**Features**: Touch-optimized interface, voice-first interaction

## Web Application Deployment

### Next.js 14 Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['bonsai-sat-tutor.vercel.app', 'supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ]
    }
  ],
  rewrites: async () => [
    {
      source: '/api/webhooks/stripe',
      destination: '/api/webhooks/stripe'
    }
  ]
};

module.exports = nextConfig;
```

### Progressive Web App (PWA) Setup
```json
// public/manifest.json
{
  "name": "Bonsai SAT Tutor",
  "short_name": "Bonsai SAT",
  "description": "AI-powered SAT preparation with contextual tutoring",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["education", "productivity"],
  "lang": "en-US",
  "dir": "ltr"
}
```

### Vercel Deployment Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/bonsai/chat/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/webhooks/stripe/route.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret",
    "OPENAI_API_KEY": "@openai-api-key",
    "GEMINI_API_KEY": "@gemini-api-key"
  },
  "regions": ["iad1", "sfo1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://bonsai-sat-tutor.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## Browser Extension Development

### Chrome Extension (Manifest V3)
```json
// browser-extension/manifest.json
{
  "manifest_version": 3,
  "name": "Bonsai SAT Tutor",
  "version": "1.0.0",
  "description": "AI-powered SAT tutoring that appears when you need it most",
  "permissions": [
    "activeTab",
    "storage",
    "background",
    "scripting"
  ],
  "host_permissions": [
    "*://*.collegeboard.org/*",
    "*://*.khanacademy.org/*",
    "*://*.bonsai-sat-tutor.vercel.app/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "*://*.collegeboard.org/*",
        "*://*.khanacademy.org/*"
      ],
      "js": ["content.js"],
      "css": ["bonsai.css"],
      "run_at": "document_end"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Bonsai SAT Tutor",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["bonsai-overlay.html", "assets/*"],
      "matches": ["<all_urls>"]
    }
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Content Script for SAT Platform Integration
```typescript
// browser-extension/content.js
class BonsaiSATExtension {
  private bonsaiOverlay: HTMLElement | null = null;
  private currentQuestion: SATQuestion | null = null;
  private observer: MutationObserver;
  
  constructor() {
    this.init();
  }
  
  private async init() {
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  private setup() {
    // Detect the platform (Bluebook, Khan Academy, etc.)
    const platform = this.detectPlatform();
    
    if (!platform) {
      console.log('Bonsai: Not on a supported SAT platform');
      return;
    }
    
    console.log(`Bonsai: Detected ${platform} platform`);
    
    // Initialize Bonsai overlay
    this.createBonsaiOverlay();
    
    // Set up question detection
    this.setupQuestionDetection(platform);
    
    // Listen for user interactions
    this.setupEventListeners();
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'CONTENT_SCRIPT_READY',
      platform: platform,
      url: window.location.href
    });
  }
  
  private detectPlatform(): 'bluebook' | 'khan_academy' | null {
    const hostname = window.location.hostname;
    
    if (hostname.includes('collegeboard.org')) {
      return 'bluebook';
    } else if (hostname.includes('khanacademy.org')) {
      return 'khan_academy';
    }
    
    return null;
  }
  
  private createBonsaiOverlay() {
    // Create floating Bonsai container
    this.bonsaiOverlay = document.createElement('div');
    this.bonsaiOverlay.id = 'bonsai-overlay';
    this.bonsaiOverlay.className = 'bonsai-floating-container';
    
    // Load Bonsai component from web app
    this.bonsaiOverlay.innerHTML = `
      <div class="bonsai-glass-bubble">
        <div class="bonsai-tree-container">
          <div class="bonsai-tree" id="bonsai-tree"></div>
        </div>
        <div class="bonsai-status" id="bonsai-status">Ready</div>
      </div>
      <div class="bonsai-chat-interface" id="bonsai-chat" style="display: none;">
        <div class="bonsai-messages" id="bonsai-messages"></div>
        <div class="bonsai-input-container">
          <input type="text" id="bonsai-input" placeholder="Ask Bonsai for help..." />
          <button id="bonsai-send">Send</button>
          <button id="bonsai-voice">🎤</button>
        </div>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(this.bonsaiOverlay);
    
    // Make draggable
    this.makeDraggable(this.bonsaiOverlay);
    
    // Load user's Bonsai state
    this.loadBonsaiState();
  }
  
  private setupQuestionDetection(platform: string) {
    // Platform-specific question detection
    const selectors = {
      bluebook: {
        question: '.question-content, .stem',
        choices: '.choice-content',
        questionType: '.question-type-indicator'
      },
      khan_academy: {
        question: '.perseus-renderer .paragraph',
        choices: '.choice .perseus-renderer',
        questionType: '.exercise-header'
      }
    };
    
    const platformSelectors = selectors[platform as keyof typeof selectors];
    
    // Set up mutation observer to detect new questions
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const questionElement = document.querySelector(platformSelectors.question);
          if (questionElement && questionElement !== this.currentQuestion?.element) {
            this.detectNewQuestion(questionElement, platform);
          }
        }
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Detect initial question
    const initialQuestion = document.querySelector(platformSelectors.question);
    if (initialQuestion) {
      this.detectNewQuestion(initialQuestion, platform);
    }
  }
  
  private async detectNewQuestion(questionElement: Element, platform: string) {
    try {
      // Extract question content
      const questionText = this.extractQuestionText(questionElement, platform);
      const questionType = this.detectQuestionType(questionElement, platform);
      const difficulty = this.estimateDifficulty(questionText);
      
      this.currentQuestion = {
        element: questionElement,
        text: questionText,
        type: questionType,
        difficulty: difficulty,
        platform: platform,
        timestamp: new Date()
      };
      
      // Update Bonsai status
      this.updateBonsaiStatus('Question detected');
      
      // Animate Bonsai to show awareness
      this.animateBonsaiAwareness();
      
      // Preload contextual hints (background)
      this.preloadContextualHints();
      
    } catch (error) {
      console.error('Bonsai: Error detecting question:', error);
    }
  }
  
  private extractQuestionText(element: Element, platform: string): string {
    // Platform-specific text extraction
    let text = element.textContent || '';
    
    // Clean up text
    text = text.replace(/\s+/g, ' ').trim();
    
    // Extract any mathematical notation or images
    const images = element.querySelectorAll('img');
    if (images.length > 0) {
      text += ` [Contains ${images.length} image(s)]`;
    }
    
    return text;
  }
  
  private detectQuestionType(element: Element, platform: string): 'math' | 'reading' | 'writing' {
    const text = element.textContent?.toLowerCase() || '';
    
    // Math indicators
    if (/equation|solve|calculate|graph|function|polynomial|algebra|geometry|trigonometry/.test(text)) {
      return 'math';
    }
    
    // Reading indicators
    if (/passage|paragraph|author|main idea|inference|tone|purpose/.test(text)) {
      return 'reading';
    }
    
    // Writing indicators (default fallback)
    return 'writing';
  }
  
  private setupEventListeners() {
    // Bonsai bubble click
    const bubble = this.bonsaiOverlay?.querySelector('.bonsai-glass-bubble');
    bubble?.addEventListener('click', () => this.toggleBonsaiChat());
    
    // Voice activation
    const voiceButton = this.bonsaiOverlay?.querySelector('#bonsai-voice');
    voiceButton?.addEventListener('click', () => this.activateVoiceInput());
    
    // Text input
    const sendButton = this.bonsaiOverlay?.querySelector('#bonsai-send');
    const input = this.bonsaiOverlay?.querySelector('#bonsai-input') as HTMLInputElement;
    
    sendButton?.addEventListener('click', () => this.sendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Global hotkey (Ctrl+Shift+B)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        this.toggleBonsaiChat();
      }
    });
    
    // Voice wake word detection
    this.setupVoiceWakeWord();
  }
  
  private async sendMessage() {
    const input = this.bonsaiOverlay?.querySelector('#bonsai-input') as HTMLInputElement;
    const message = input?.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    this.addMessageToChat('user', message);
    
    // Show typing indicator
    this.addMessageToChat('bonsai', 'Thinking...', true);
    
    try {
      // Send to Bonsai AI service
      const response = await this.getBonsaiResponse(message);
      
      // Remove typing indicator and add response
      this.removeTypingIndicator();
      this.addMessageToChat('bonsai', response.text);
      
      // Update user progress
      if (response.experienceGained) {
        this.updateBonsaiProgress(response.experienceGained);
      }
      
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessageToChat('bonsai', 'Sorry, I encountered an error. Please try again.');
      console.error('Bonsai: Error getting response:', error);
    }
  }
  
  private async getBonsaiResponse(message: string): Promise<BonsaiResponse> {
    // Get user authentication
    const userToken = await this.getUserToken();
    
    // Prepare request
    const requestData = {
      message: message,
      context: {
        questionText: this.currentQuestion?.text,
        questionType: this.currentQuestion?.type,
        difficulty: this.currentQuestion?.difficulty,
        platform: this.currentQuestion?.platform,
        url: window.location.href
      },
      sessionId: this.getSessionId()
    };
    
    // Send to web app API
    const response = await fetch('https://bonsai-sat-tutor.vercel.app/api/bonsai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  }
  
  private makeDraggable(element: HTMLElement) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    const bubble = element.querySelector('.bonsai-glass-bubble') as HTMLElement;
    
    bubble.addEventListener('mousedown', (e) => {
      isDragging = true;
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
    });
    
    function dragMove(e: MouseEvent) {
      if (!isDragging) return;
      
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      element.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    
    function dragEnd() {
      isDragging = false;
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
      
      // Save position
      chrome.storage.local.set({
        bonsaiPosition: { x: currentX, y: currentY }
      });
    }
  }
}

// Initialize extension when script loads
new BonsaiSATExtension();
```

### Extension Build Process
```json
// browser-extension/package.json
{
  "name": "bonsai-sat-tutor-extension",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack --mode=production",
    "build:dev": "webpack --mode=development",
    "watch": "webpack --mode=development --watch",
    "package:chrome": "cd dist && zip -r ../bonsai-chrome-extension.zip .",
    "package:firefox": "web-ext build --source-dir=dist --artifacts-dir=packages",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.246",
    "typescript": "^5.0.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "ts-loader": "^9.4.0",
    "copy-webpack-plugin": "^11.0.0"
  }
}
```

### Extension Distribution
```bash
# Chrome Web Store submission
npm run build
npm run package:chrome

# Upload bonsai-chrome-extension.zip to Chrome Developer Console
# https://chrome.google.com/webstore/devconsole/

# Firefox Add-ons submission
npm run package:firefox

# Upload to Firefox Developer Hub
# https://addons.mozilla.org/developers/

# Safari Extension (requires Xcode)
xcrun safari-web-extension-converter --app-name "Bonsai SAT Tutor" \
  --bundle-identifier "com.bonsai.sat-tutor" \
  --swift dist/
```

## Desktop Application (Electron)

### Electron Configuration
```json
// desktop-app/package.json
{
  "name": "bonsai-sat-tutor-desktop",
  "version": "1.0.0",
  "description": "Bonsai SAT Tutor Desktop Application",
  "main": "dist/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \"npm run build:watch\" \"electron .\"",
    "build": "tsc && webpack --mode=production",
    "build:watch": "tsc --watch",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "package:linux": "electron-builder --linux",
    "dist": "npm run build && electron-builder --publish=never",
    "publish": "npm run build && electron-builder --publish=always"
  },
  "build": {
    "appId": "com.bonsai.sat-tutor",
    "productName": "Bonsai SAT Tutor",
    "directories": {
      "buildResources": "assets",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "assets/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.education",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ],
      "notarize": {
        "teamId": "BONSAI_TEAM_ID"
      }
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64", "ia32"]
        }
      ],
      "publisherName": "Bonsai Education Inc."
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ],
      "category": "Education"
    },
    "publish": {
      "provider": "github",
      "owner": "bonsai-education",
      "repo": "bonsai-sat-tutor-desktop"
    }
  },
  "dependencies": {
    "electron": "^26.0.0",
    "electron-updater": "^6.1.0",
    "electron-store": "^8.1.0"
  }
}
```

### Main Process (main.ts)
```typescript
// desktop-app/src/main.ts
import { app, BrowserWindow, Menu, shell, ipcMain, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import path from 'path';

class BonsaiDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private store: Store;
  
  constructor() {
    this.store = new Store();
    this.initializeApp();
  }
  
  private initializeApp() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupGlobalShortcuts();
      this.setupAutoUpdater();
      this.setupIPC();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });
    
    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    // Handle app activation
    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });
  }
  
  private createMainWindow() {
    // Get stored window bounds
    const savedBounds = this.store.get('windowBounds', {
      width: 1200,
      height: 800,
      x: undefined,
      y: undefined
    });
    
    this.mainWindow = new BrowserWindow({
      width: savedBounds.width,
      height: savedBounds.height,
      x: savedBounds.x,
      y: savedBounds.y,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true
      },
      icon: path.join(__dirname, '../assets/icon.png'),
      show: false // Don't show until ready
    });
    
    // Load the web app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadURL('https://bonsai-sat-tutor.vercel.app');
    }
    
    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      // Focus window
      if (process.platform === 'darwin') {
        app.dock.show();
      }
      this.mainWindow?.focus();
    });
    
    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
    
    // Save window bounds on resize/move
    this.mainWindow.on('resize', this.saveWindowBounds.bind(this));
    this.mainWindow.on('move', this.saveWindowBounds.bind(this));
    
    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }
  
  private saveWindowBounds() {
    if (this.mainWindow) {
      const bounds = this.mainWindow.getBounds();
      this.store.set('windowBounds', bounds);
    }
  }
  
  private setupMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Study Session',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('new-study-session');
            }
          },
          {
            label: 'Export Progress',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('export-progress');
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow?.webContents.send('open-preferences');
            }
          }
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
      },
      {
        label: 'Bonsai',
        submenu: [
          {
            label: 'Chat with Bonsai',
            accelerator: 'CmdOrCtrl+B',
            click: () => {
              this.mainWindow?.webContents.send('toggle-bonsai-chat');
            }
          },
          {
            label: 'Voice Command',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => {
              this.mainWindow?.webContents.send('activate-voice-command');
            }
          },
          { type: 'separator' },
          {
            label: 'View Progress',
            click: () => {
              this.mainWindow?.webContents.send('view-progress');
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Getting Started',
            click: () => {
              shell.openExternal('https://bonsai-sat-tutor.vercel.app/help');
            }
          },
          {
            label: 'Keyboard Shortcuts',
            click: () => {
              this.mainWindow?.webContents.send('show-shortcuts');
            }
          },
          { type: 'separator' },
          {
            label: 'About Bonsai SAT Tutor',
            click: () => {
              this.mainWindow?.webContents.send('show-about');
            }
          }
        ]
      }
    ];
    
    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
  
  private setupGlobalShortcuts() {
    // Global shortcut to show/hide Bonsai (even when app not focused)
    globalShortcut.register('CmdOrCtrl+Shift+B', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });
  }
  
  private setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      this.mainWindow?.webContents.send('update-available');
    });
    
    autoUpdater.on('update-downloaded', () => {
      this.mainWindow?.webContents.send('update-downloaded');
    });
  }
  
  private setupIPC() {
    // Handle IPC messages from renderer process
    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });
    
    ipcMain.handle('get-user-data-path', () => {
      return app.getPath('userData');
    });
    
    ipcMain.handle('install-update', () => {
      autoUpdater.quitAndInstall();
    });
    
    ipcMain.handle('show-item-in-folder', (event, fullPath) => {
      shell.showItemInFolder(fullPath);
    });
    
    ipcMain.handle('open-external', (event, url) => {
      shell.openExternal(url);
    });
  }
}

// Create app instance
new BonsaiDesktopApp();
```

### Auto-Update Configuration
```typescript
// desktop-app/src/updater.ts
import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

export class AppUpdater {
  constructor() {
    autoUpdater.logger = console;
    autoUpdater.checkForUpdatesAndNotify();
  }
  
  setupUpdateHandlers() {
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });
    
    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
    });
    
    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info);
    });
    
    autoUpdater.on('error', (err) => {
      console.error('Error in auto-updater:', err);
    });
    
    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage += ` - Downloaded ${progressObj.percent}%`;
      logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
      console.log(logMessage);
    });
    
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info);
      this.showUpdateDialog();
    });
  }
  
  private showUpdateDialog() {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of Bonsai SAT Tutor is ready to install.',
      detail: 'The application will restart to apply the update.',
      buttons: ['Install Now', 'Install Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
}
```

## Platform-Specific Distribution

### macOS Distribution
```bash
# Code signing and notarization
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"
export APPLE_ID="developer@bonsai.com"
export APPLE_ID_PASSWORD="app_specific_password"

# Build and notarize
npm run package:mac

# Upload to Mac App Store (optional)
xcrun altool --upload-app --type osx --file "release/Bonsai SAT Tutor.pkg" \
  --username "$APPLE_ID" --password "$APPLE_ID_PASSWORD"
```

### Windows Distribution
```bash
# Code signing
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"

# Build Windows installer
npm run package:win

# Optional: Submit to Microsoft Store
# Use Windows App Certification Kit for validation
```

### Linux Distribution
```bash
# Build AppImage and Debian package
npm run package:linux

# Distribute via:
# - Direct download from website
# - Snap Store
# - Flathub
# - Debian/Ubuntu repositories
```

## Onboarding Flow Implementation

### Progressive Onboarding System
```typescript
// src/lib/onboarding.ts
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  prerequisite?: string;
  platform?: 'web' | 'extension' | 'desktop';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bonsai SAT Tutor',
    description: 'Your AI-powered study companion',
    component: WelcomeStep
  },
  {
    id: 'goal_setting',
    title: 'Set Your Goals',
    description: 'Tell us about your SAT preparation goals',
    component: GoalSettingStep
  },
  {
    id: 'platform_selection',
    title: 'Choose Your Platform',
    description: 'Select how you want to use Bonsai',
    component: PlatformSelectionStep
  },
  {
    id: 'bonsai_introduction',
    title: 'Meet Your Bonsai',
    description: 'Learn how your AI tutor works',
    component: BonsaiIntroductionStep
  },
  {
    id: 'first_interaction',
    title: 'Try It Out',
    description: 'Practice with a sample SAT question',
    component: FirstInteractionStep
  },
  {
    id: 'subscription_setup',
    title: 'Choose Your Plan',
    description: 'Select the best plan for your needs',
    component: SubscriptionSetupStep
  }
];

export class OnboardingManager {
  async getNextStep(userId: string): Promise<OnboardingStep | null> {
    const completedSteps = await this.getCompletedSteps(userId);
    const availableSteps = ONBOARDING_STEPS.filter(
      step => !completedSteps.includes(step.id) &&
      (!step.prerequisite || completedSteps.includes(step.prerequisite))
    );
    
    return availableSteps[0] || null;
  }
  
  async completeStep(userId: string, stepId: string): Promise<void> {
    await supabase
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        step_id: stepId,
        completed_at: new Date().toISOString()
      });
  }
  
  async getOnboardingProgress(userId: string): Promise<number> {
    const completedSteps = await this.getCompletedSteps(userId);
    return (completedSteps.length / ONBOARDING_STEPS.length) * 100;
  }
}
```

### User Activation Requirements
```typescript
// src/lib/activation.ts
interface ActivationCriteria {
  firstStudySession: boolean;
  bonsaiInteraction: boolean;
  goalSet: boolean;
  subscriptionActive: boolean;
}

export class UserActivationTracker {
  async checkActivationStatus(userId: string): Promise<ActivationCriteria> {
    const [sessions, interactions, user, subscription] = await Promise.all([
      this.getStudySessions(userId),
      this.getBonsaiInteractions(userId),
      this.getUser(userId),
      this.getSubscription(userId)
    ]);
    
    return {
      firstStudySession: sessions.length > 0,
      bonsaiInteraction: interactions.length > 0,
      goalSet: !!user.target_sat_score,
      subscriptionActive: subscription?.status === 'active'
    };
  }
  
  async trackActivationEvent(userId: string, event: string): Promise<void> {
    await analytics.track({
      userId,
      event: `activation_${event}`,
      properties: {
        timestamp: new Date().toISOString(),
        platform: this.detectPlatform()
      }
    });
  }
}
```

## Auto-Update Mechanisms

### Web Application Updates
- **Next.js Automatic Updates**: Vercel handles deployment and updates
- **Service Worker**: Cache management for offline functionality
- **Feature Flags**: Gradual feature rollouts
- **Hot Reloading**: Development environment updates

### Browser Extension Updates
- **Chrome Web Store**: Automatic updates for published extensions
- **Firefox Add-ons**: Automatic updates through Mozilla's system
- **Manual Distribution**: Version checking and update prompts

### Desktop Application Updates
- **Electron Builder**: Automated update system
- **GitHub Releases**: Distribution and update hosting
- **Delta Updates**: Minimize download size for updates
- **Rollback Capability**: Automatic rollback on update failures

## Deployment and Distribution Processes

### Continuous Integration Pipeline
```yaml
# .github/workflows/release.yml
name: Build and Release
on:
  push:
    tags: ['v*']

jobs:
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          
  build-extension:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd browser-extension && npm ci
      - run: cd browser-extension && npm run build
      - name: Package Extension
        run: cd browser-extension && npm run package:chrome
      - name: Upload to Chrome Web Store
        uses: mnao305/chrome-extension-upload@v4.0.1
        with:
          file-path: browser-extension/bonsai-chrome-extension.zip
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
          
  build-desktop:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd desktop-app && npm ci
      - run: cd desktop-app && npm run build
      - run: cd desktop-app && npm run package
      - name: Upload Release Assets
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: desktop-app/release/*
```

This comprehensive installation and distribution strategy ensures Bonsai SAT Tutor reaches students across all platforms and devices, providing seamless access to AI-powered SAT preparation regardless of their preferred study environment.