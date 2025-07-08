// Bonsai SAT Tutor v2 - Glass-Inspired AI Assistant
// Always available, minimal, powerful

const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const BehaviorTracker = require('./behavior-tracker');
const AdvancedAIService = require('./advanced-ai-service');

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
    this.behaviorTracker = null;
    this.aiService = null;
    this.proactiveHelpEnabled = true;
    this.lastProactiveHelp = 0;
  }

  async initialize() {
    console.log('🌱 Bonsai SAT Tutor v2: Initializing Glass-inspired assistant...');
    
    // Initialize advanced services
    this.behaviorTracker = new BehaviorTracker(store);
    this.aiService = new AdvancedAIService(store);
    
    // Initialize AI service
    await this.aiService.initialize();
    
    // Setup behavior tracking event listeners
    this.setupBehaviorTracking();
    
    // Create floating assistant button
    await this.createFloatingAssistant();
    
    // Setup shortcuts
    this.setupGlobalShortcuts();
    
    // Setup IPC handlers
    this.setupIPC();
    
    // Start behavior tracking
    await this.behaviorTracker.startTracking();
    
    console.log('✅ Bonsai v2 Ready - Advanced AI and behavior tracking active!');
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

    // Advanced AI help
    ipcMain.handle('get-ai-help', async (event, data) => {
      if (this.behaviorTracker) {
        this.behaviorTracker.incrementHelpRequests();
      }
      return await this.getAdvancedAIResponse(data);
    });

    // Behavior tracking
    ipcMain.handle('get-behavior-metrics', () => {
      return this.behaviorTracker ? this.behaviorTracker.getCurrentMetrics() : {};
    });

    ipcMain.handle('get-behavior-prediction', async () => {
      if (!this.aiService) return null;
      return await this.aiService.getBehavioralPrediction('desktop-user');
    });

    // Screenshot analysis
    ipcMain.handle('analyze-screenshot', async (event, screenshot) => {
      if (!this.aiService) return null;
      return await this.aiService.analyzeScreenshot(screenshot);
    });

    // Settings management
    ipcMain.handle('get-settings', () => {
      return store.get('settings');
    });

    ipcMain.handle('save-settings', (event, settings) => {
      store.set('settings', { ...store.get('settings'), ...settings });
      
      // Update proactive help setting
      if ('proactiveHelp' in settings) {
        this.proactiveHelpEnabled = settings.proactiveHelp;
      }
      
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

    // Advanced features
    ipcMain.handle('get-session-history', () => {
      return this.behaviorTracker ? this.behaviorTracker.getSessionHistory() : {};
    });

    ipcMain.handle('get-ai-service-status', () => {
      return this.aiService ? this.aiService.getServiceStatus() : {};
    });
  }

  async getAdvancedAIResponse(data) {
    const { question, type = 'help', context = {}, screenshot } = data;
    
    if (!this.aiService) {
      return {
        success: false,
        error: 'AI service not initialized'
      };
    }

    try {
      // Get current behavior metrics
      const behaviorMetrics = this.behaviorTracker ? 
        this.behaviorTracker.getCurrentMetrics() : {};
      
      // Build conversation context
      const messages = [];
      if (context.conversation && context.conversation.length > 0) {
        messages.push(...context.conversation.slice(-5)); // Last 5 messages
      }
      messages.push({ role: 'user', content: question });
      
      // Enhanced context with desktop-specific info
      const enhancedContext = {
        ...context,
        platform: 'desktop',
        userId: 'desktop-user',
        sessionId: `session_${Date.now()}`,
        timestamp: Date.now(),
        behaviorMetrics
      };
      
      // Use advanced AI service
      const response = await this.aiService.advancedChat(
        messages,
        type,
        enhancedContext,
        screenshot,
        behaviorMetrics
      );
      
      // Track behavior data
      if (this.behaviorTracker) {
        await this.aiService.trackBehavior({
          userId: 'desktop-user',
          sessionId: enhancedContext.sessionId,
          action: 'ai_request',
          type: type,
          timestamp: Date.now(),
          context: enhancedContext
        });
      }
      
      return response;
      
    } catch (error) {
      console.error('Advanced AI Error:', error);
      return {
        success: false,
        error: error.message || 'AI service temporarily unavailable'
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

  setupBehaviorTracking() {
    if (!this.behaviorTracker) return;
    
    // Listen for struggle detection
    this.behaviorTracker.on('struggle-detected', (struggle) => {
      console.log(`😰 Struggle detected: ${struggle.type}`);
      this.handleStruggleDetection(struggle);
    });
    
    // Listen for question detection
    this.behaviorTracker.on('question-detected', (questionData) => {
      console.log('📝 Question detected on screen');
      this.handleQuestionDetection(questionData);
    });
    
    // Listen for help needed predictions
    this.behaviorTracker.on('help-needed', (prediction) => {
      console.log('🆘 Help needed prediction:', prediction.suggestedAction);
      this.handleHelpNeeded(prediction);
    });
  }
  
  async handleStruggleDetection(struggle) {
    if (!this.proactiveHelpEnabled) return;
    
    const now = Date.now();
    const timeSinceLastHelp = now - this.lastProactiveHelp;
    
    // Don't be too aggressive with proactive help
    if (timeSinceLastHelp < 60000) return; // 1 minute cooldown
    
    // Show subtle indication in floating button
    if (this.floatingWindow) {
      this.floatingWindow.webContents.send('show-struggle-indicator', struggle.type);
    }
    
    // For high intensity struggles, offer immediate help
    if (struggle.intensity > 0.8) {
      this.lastProactiveHelp = now;
      this.offerProactiveHelp('immediate', struggle);
    }
  }
  
  async handleQuestionDetection(questionData) {
    if (!this.behaviorTracker) return;
    
    // Analyze if user might need help with this question
    const metrics = this.behaviorTracker.getCurrentMetrics();
    
    // If they've been idle or struggling, offer help
    if (metrics.idleTime > 30000 || metrics.strugglingIndicators.length > 0) {
      setTimeout(() => {
        this.offerProactiveHelp('gentle', {
          type: 'question_detected',
          questionData
        });
      }, 45000); // Wait 45 seconds before offering help
    }
  }
  
  async handleHelpNeeded(prediction) {
    if (!this.proactiveHelpEnabled) return;
    
    const now = Date.now();
    const timeSinceLastHelp = now - this.lastProactiveHelp;
    
    if (timeSinceLastHelp < prediction.timeUntilIntervention) return;
    
    this.lastProactiveHelp = now;
    
    switch (prediction.suggestedAction) {
      case 'immediate_help':
        this.offerProactiveHelp('immediate', prediction);
        break;
      case 'gentle_prompt':
        this.offerProactiveHelp('gentle', prediction);
        break;
      case 'monitor':
        // Just update the floating button to show availability
        if (this.floatingWindow) {
          this.floatingWindow.webContents.send('show-help-available');
        }
        break;
    }
  }
  
  async offerProactiveHelp(urgency, context) {
    console.log(`🤝 Offering ${urgency} proactive help`);
    
    if (urgency === 'immediate') {
      // Open chat window with proactive message
      await this.createChatWindow();
      if (this.chatWindow) {
        this.chatWindow.webContents.send('show-proactive-help', {
          urgency,
          context,
          message: "I noticed you might be struggling with this problem. Would you like some help? I can provide a hint, explain the concept, or walk through the solution step-by-step."
        });
      }
    } else {
      // Show subtle notification in floating button
      if (this.floatingWindow) {
        this.floatingWindow.webContents.send('show-proactive-offer', {
          urgency,
          context
        });
      }
    }
  }
  
  cleanup() {
    globalShortcut.unregisterAll();
    
    if (this.behaviorTracker) {
      this.behaviorTracker.stopTracking();
    }
    
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