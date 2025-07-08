// Bonsai SAT Tutor v2 - Glass-Inspired AI Assistant
// Always available, minimal, powerful

const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Configuration
const store = new Store({
  defaults: {
    settings: {
      apiKey: '',
      position: { x: 50, y: 50 },
      autoStart: true,
      alwaysOnTop: true,
      shortcuts: true
    },
    conversation: {
      history: [],
      currentSubject: 'math'
    }
  }
});

class BonsaiTutorV2 {
  constructor() {
    this.floatingWindow = null;
    this.chatWindow = null;
    this.isVisible = false;
  }

  async initialize() {
    console.log('🌱 Bonsai SAT Tutor v2: Initializing Glass-inspired assistant...');
    
    // Create floating assistant button
    await this.createFloatingAssistant();
    
    // Setup shortcuts
    this.setupGlobalShortcuts();
    
    // Setup IPC handlers
    this.setupIPC();
    
    console.log('✅ Bonsai v2 Ready - Floating assistant active!');
  }

  async createFloatingAssistant() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const position = store.get('settings.position');
    
    this.floatingWindow = new BrowserWindow({
      width: 80,
      height: 80,
      x: position.x || width - 100,
      y: position.y || 50,
      frame: false,
      transparent: true,
      alwaysOnTop: store.get('settings.alwaysOnTop'),
      skipTaskbar: true,
      resizable: false,
      movable: true,
      focusable: false, // Glass-style: doesn't steal focus
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    await this.floatingWindow.loadFile(path.join(__dirname, 'floating-button.html'));
    
    // Save position when moved
    this.floatingWindow.on('moved', () => {
      const [x, y] = this.floatingWindow.getPosition();
      store.set('settings.position', { x, y });
    });

    // Click-through when not interacting (Glass-style)
    this.floatingWindow.setIgnoreMouseEvents(false);
    
    console.log('🔘 Floating assistant created');
  }

  async createChatWindow() {
    if (this.chatWindow) {
      this.chatWindow.show();
      this.chatWindow.focus();
      return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    this.chatWindow = new BrowserWindow({
      width: 450,
      height: 600,
      x: width - 470,
      y: 100,
      frame: true,
      transparent: false,
      alwaysOnTop: true,
      resizable: true,
      movable: true,
      minimizable: true,
      maximizable: false,
      title: 'Bonsai SAT Tutor',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    await this.chatWindow.loadFile(path.join(__dirname, 'chat-interface.html'));
    
    this.chatWindow.on('closed', () => {
      this.chatWindow = null;
      this.isVisible = false;
    });

    this.isVisible = true;
    console.log('💬 Chat interface opened');
  }

  setupGlobalShortcuts() {
    if (store.get('settings.shortcuts')) {
      // Toggle assistant (Cmd+Shift+B)
      globalShortcut.register('CommandOrControl+Shift+B', () => {
        this.toggleAssistant();
      });

      // Quick help (Cmd+Shift+H)
      globalShortcut.register('CommandOrControl+Shift+H', () => {
        this.quickHelp();
      });

      console.log('⌨️ Global shortcuts registered');
    }
  }

  setupIPC() {
    // Toggle chat interface
    ipcMain.handle('toggle-chat', () => {
      if (this.isVisible && this.chatWindow) {
        this.chatWindow.close();
      } else {
        this.createChatWindow();
      }
    });

    // Get AI help
    ipcMain.handle('get-ai-help', async (event, data) => {
      return await this.getAIResponse(data);
    });

    // Settings management
    ipcMain.handle('get-settings', () => {
      return store.get('settings');
    });

    ipcMain.handle('save-settings', (event, settings) => {
      store.set('settings', { ...store.get('settings'), ...settings });
      return true;
    });

    // Conversation management
    ipcMain.handle('get-conversation', () => {
      return store.get('conversation.history', []);
    });

    ipcMain.handle('save-message', (event, message) => {
      const history = store.get('conversation.history', []);
      history.push({
        ...message,
        timestamp: Date.now()
      });
      
      // Keep only last 50 messages
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      store.set('conversation.history', history);
      return true;
    });

    ipcMain.handle('clear-conversation', () => {
      store.set('conversation.history', []);
      return true;
    });
  }

  async getAIResponse(data) {
    const { question, type = 'help', context = {} } = data;
    const apiKey = store.get('settings.apiKey');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Please configure your OpenAI API key in settings'
      };
    }

    try {
      const axios = require('axios');
      
      // Create educational prompt based on type
      let systemPrompt = '';
      let userPrompt = question;

      switch (type) {
        case 'hint':
          systemPrompt = 'You are an encouraging SAT tutor. Provide a helpful hint that guides the student toward the answer without giving it away. Be supportive and educational.';
          break;
        case 'explanation':
          systemPrompt = 'You are a patient SAT teacher. Explain the concept behind this question clearly, using simple examples. Focus on understanding, not just the answer.';
          break;
        case 'solution':
          systemPrompt = 'You are a thorough SAT instructor. Provide a complete step-by-step solution, explaining each step clearly. Teach the method so they can solve similar problems.';
          break;
        case 'similar':
          systemPrompt = 'You are a creative SAT tutor. Generate 2-3 similar practice problems with the same concept but different scenarios. Include brief solutions.';
          break;
        default:
          systemPrompt = 'You are a supportive SAT tutor. Help the student understand this question and guide them toward learning the concept.';
      }

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini', // Fast and cost-effective
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        type: type
      };

    } catch (error) {
      console.error('AI API Error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  toggleAssistant() {
    if (this.isVisible && this.chatWindow) {
      this.chatWindow.close();
    } else {
      this.createChatWindow();
    }
  }

  quickHelp() {
    this.createChatWindow();
    // Focus on input after creation
    setTimeout(() => {
      if (this.chatWindow) {
        this.chatWindow.webContents.send('focus-input');
      }
    }, 500);
  }

  cleanup() {
    globalShortcut.unregisterAll();
    if (this.floatingWindow) this.floatingWindow.destroy();
    if (this.chatWindow) this.chatWindow.destroy();
  }
}

// App lifecycle
const tutorApp = new BonsaiTutorV2();

app.whenReady().then(() => {
  tutorApp.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    tutorApp.createFloatingAssistant();
  }
});

app.on('will-quit', () => {
  tutorApp.cleanup();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    tutorApp.toggleAssistant();
  });
}

module.exports = BonsaiTutorV2;