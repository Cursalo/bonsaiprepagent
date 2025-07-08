// Bonsai SAT Desktop Assistant - Main Process
// Companion app for Bluebook SAT integration

const { app, BrowserWindow, screen, ipcMain, Menu, Tray, globalShortcut, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const logger = require('./logger');
const BluebookMonitor = require('./bluebook-monitor');
const AIService = require('./ai-service');
const DashboardSync = require('./dashboard-sync');

// Initialize electron store for settings
const store = new Store({
  defaults: {
    settings: {
      apiKey: null,
      userId: null,
      practiceMode: true,
      overlayPosition: { x: 100, y: 100 },
      autoDetect: true,
      sound: true,
      analytics: true
    },
    usage: {
      sessionsToday: 0,
      questionsHelped: 0,
      totalSessions: 0,
      lastUsed: null
    }
  }
});

class BonsaiSATDesktop {
  constructor() {
    this.mainWindow = null;
    this.overlayWindow = null;
    this.tray = null;
    this.bluebookMonitor = null;
    this.aiService = null;
    this.dashboardSync = null;
    this.isMonitoring = false;
    this.currentQuestion = null;
    this.pendingQuestions = [];
  }

  async initialize() {
    try {
      logger.logStartup({
        autoDetect: store.get('settings.autoDetect'),
        hasApiKey: !!store.get('settings.apiKey')
      });
      logger.logSystemInfo();
      
      logger.info('Bonsai SAT Desktop: Initializing...');
      
      // Set up app event handlers
      this.setupAppHandlers();
      logger.debug('App event handlers set up');
      
      // Create main window
      await this.createMainWindow();
      
      // Create system tray
      this.createTray();
      
      // Initialize core components
      logger.info('Initializing core components...');
      this.bluebookMonitor = new BluebookMonitor();
      this.aiService = new AIService(store.get('settings.apiKey'));
      this.dashboardSync = new DashboardSync({
        apiKey: store.get('settings.apiKey'),
        userId: store.get('settings.userId')
      });
      
      // Set up IPC handlers
      this.setupIPC();
      logger.debug('IPC handlers registered');
      
      // Register global shortcuts
      this.registerShortcuts();
      logger.debug('Global shortcuts registered');
      
      // Start monitoring if settings allow
      if (store.get('settings.autoDetect')) {
        await this.startMonitoring();
      }
      
      logger.success('Bonsai SAT Desktop: Ready!');
      
    } catch (error) {
      logger.logError('initialize', error);
      throw error;
    }
  }

  setupAppHandlers() {
    app.on('window-all-closed', () => {
      // Keep app running in system tray on macOS
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
    
    app.on('will-quit', () => {
      this.cleanup();
    });
  }

  async createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 600,
      x: width - 420,
      y: 50,
      show: true, // Show by default for better user experience
      resizable: true,
      minimizable: true,
      maximizable: false,
      alwaysOnTop: false,
      skipTaskbar: false,
      title: 'Bonsai SAT Assistant',
      icon: path.join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    logger.info('Loading main window interface...');
    
    // Load the main interface
    try {
      await this.mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
      logger.success('Main window loaded successfully');
    } catch (error) {
      logger.logError('createMainWindow', error);
      throw error;
    }
    
    // Handle window events
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
    
    this.mainWindow.on('minimize', () => {
      this.mainWindow.hide(); // Hide to tray instead of minimize
    });
    
    // Development tools
    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  async createOverlayWindow() {
    if (this.overlayWindow) {
      this.overlayWindow.show();
      return;
    }

    const position = store.get('settings.overlayPosition');
    
    this.overlayWindow = new BrowserWindow({
      width: 380,
      height: 520,
      x: position.x,
      y: position.y,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: true,
      focusable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    await this.overlayWindow.loadFile(path.join(__dirname, 'renderer/overlay.html'));
    
    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
    });
    
    // Save position when moved
    this.overlayWindow.on('moved', () => {
      const [x, y] = this.overlayWindow.getPosition();
      store.set('settings.overlayPosition', { x, y });
    });
  }

  createTray() {
    try {
      const iconPath = path.join(__dirname, '../assets/icon.png');
      this.tray = new Tray(iconPath);
      logger.success('System tray created');
    
      const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Bonsai SAT Assistant',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Show Dashboard',
        click: () => this.showMainWindow()
      },
      {
        label: 'Toggle Monitoring',
        click: () => this.toggleMonitoring()
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => this.openSettings()
      },
      {
        label: 'Help',
        click: () => this.openHelp()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Bonsai SAT Assistant');
    
    // Double-click to show main window
    this.tray.on('double-click', () => {
      this.showMainWindow();
    });
    
    } catch (error) {
      logger.logError('createTray', error);
      // Continue without tray
    }
  }

  setupIPC() {
    // Settings management
    ipcMain.handle('get-settings', () => {
      return store.get('settings');
    });
    
    ipcMain.handle('save-settings', (event, settings) => {
      const newSettings = { ...store.get('settings'), ...settings };
      store.set('settings', newSettings);
      
      // Update AI service if API key changed
      if (settings.apiKey && this.aiService) {
        this.aiService.configure(settings.apiKey);
      }
      
      return true;
    });
    
    // AI Service management
    ipcMain.handle('test-ai-connection', async () => {
      if (!this.aiService || !this.aiService.isReady()) {
        return {
          success: false,
          error: 'AI Service not configured'
        };
      }
      return await this.aiService.testConnection();
    });
    
    ipcMain.handle('get-ai-status', () => {
      return this.aiService ? this.aiService.getStatus() : {
        configured: false,
        hasApiKey: false,
        ready: false
      };
    });
    
    // Usage statistics
    ipcMain.handle('get-usage-stats', () => {
      return store.get('usage');
    });
    
    // Monitoring control
    ipcMain.handle('start-monitoring', () => this.startMonitoring());
    ipcMain.handle('stop-monitoring', () => this.stopMonitoring());
    ipcMain.handle('get-monitoring-status', () => this.isMonitoring);
    
    // Overlay control
    ipcMain.handle('show-overlay', () => this.showOverlay());
    ipcMain.handle('hide-overlay', () => this.hideOverlay());
    
    // Force analyze screen
    ipcMain.handle('force-analyze-screen', async () => {
      try {
        logger.info('🎯 Force analyzing screen...');
        
        if (!this.bluebookMonitor) {
          return { success: false, error: 'Monitor not initialized' };
        }
        
        // Force immediate analysis
        const questionData = await this.bluebookMonitor.analyzeCurrentScreen();
        
        if (questionData) {
          // Manually trigger question detection
          await this.handleQuestionDetected(questionData);
          return { success: true, questionDetected: true };
        }
        
        return { success: true, questionDetected: false };
      } catch (error) {
        logger.logError('force-analyze-screen', error);
        return { success: false, error: error.message };
      }
    });
    
    // Question analysis
    ipcMain.handle('analyze-current-question', () => {
      return this.currentQuestion;
    });
    
    ipcMain.handle('get-ai-help', async (event, { questionText, helpType, questionData }) => {
      return await this.getAIHelp(questionText, helpType, questionData);
    });
    
    // Test screen capture functionality
    ipcMain.handle('test-screen-capture', async () => {
      try {
        // Check permissions first
        const { systemPreferences } = require('electron');
        
        if (process.platform === 'darwin') {
          const hasPermission = systemPreferences.getMediaAccessStatus('screen');
          logger.info(`Test capture - permission status: ${hasPermission}`);
          // Skip permission check for now since user confirmed it's granted
        }
        
        if (!this.bluebookMonitor) {
          return { success: false, error: 'Monitor not initialized' };
        }
        
        await this.bluebookMonitor.analyzeCurrentScreen();
        return { success: true, message: 'Screen capture test completed successfully!' };
      } catch (error) {
        logger.logError('test-screen-capture', error);
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('generate-practice-questions', async (event, { subject, difficulty, count }) => {
      if (!this.aiService || !this.aiService.isReady()) {
        return {
          success: false,
          error: 'AI Service not configured'
        };
      }
      return await this.aiService.generatePracticeQuestions(subject, difficulty, count);
    });
    
    ipcMain.handle('get-study-recommendations', async (event, performanceData) => {
      if (!this.aiService || !this.aiService.isReady()) {
        return {
          success: false,
          error: 'AI Service not configured'
        };
      }
      return await this.aiService.getStudyRecommendations(performanceData);
    });
    
    // Dashboard sync
    ipcMain.handle('sync-to-dashboard', async (event, data) => {
      return await this.dashboardSync.syncSession(data);
    });
    
    // Debug and logging
    ipcMain.handle('get-log-paths', () => {
      return logger.getLogPaths();
    });
    
    ipcMain.handle('open-log-directory', async () => {
      const { shell } = require('electron');
      const logPaths = logger.getLogPaths();
      await shell.openPath(logPaths.logDirectory);
    });
  }

  registerShortcuts() {
    // Toggle overlay
    globalShortcut.register('CommandOrControl+Shift+B', () => {
      this.toggleOverlay();
    });
    
    // Quick help
    globalShortcut.register('CommandOrControl+Shift+H', () => {
      this.triggerQuickHelp();
    });
    
    // Toggle monitoring
    globalShortcut.register('CommandOrControl+Shift+M', () => {
      this.toggleMonitoring();
    });
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    logger.info('🔍 Starting Bluebook monitoring...');
    
    try {
      // Check screen recording permissions first
      const { systemPreferences } = require('electron');
      
      if (process.platform === 'darwin') {
        const hasPermission = systemPreferences.getMediaAccessStatus('screen');
        logger.info(`Screen recording permission: ${hasPermission}`);
        
        // TEMPORARY: Skip permission check since user confirmed they granted it
        // TODO: Fix permission detection logic later
        logger.info('🚀 Bypassing permission check - user confirmed permissions granted');
      }
      
      // Start monitoring Bluebook application
      await this.bluebookMonitor.start();
      
      // Set up question detection
      this.bluebookMonitor.on('questionDetected', async (questionData) => {
        await this.handleQuestionDetected(questionData);
      });
      
      // Set up live status updates
      this.bluebookMonitor.on('liveStatus', (statusData) => {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('live-status-update', statusData);
        }
      });
      
      this.bluebookMonitor.on('practiceMode', (isPractice) => {
        this.handleModeChange(isPractice);
      });
      
      this.isMonitoring = true;
      
      // Update tray tooltip
      if (this.tray) {
        this.tray.setToolTip('Bonsai SAT Assistant - Monitoring Active');
      }
      
      // Send status to main window
      if (this.mainWindow) {
        this.mainWindow.webContents.send('monitoring-started');
      }
      
      logger.success('Monitoring started successfully');
      
    } catch (error) {
      logger.logError('startMonitoring', error);
      dialog.showErrorBox('Monitoring Error', 
        `Failed to start monitoring: ${error.message}`);
    }
  }

  async stopMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log('⏹️ Stopping Bluebook monitoring...');
    
    await this.bluebookMonitor.stop();
    this.isMonitoring = false;
    
    // Update tray tooltip
    this.tray.setToolTip('Bonsai SAT Assistant - Monitoring Stopped');
    
    // Hide overlay if shown
    this.hideOverlay();
  }

  async handleQuestionDetected(questionData) {
    logger.info('📝 Question detected:', questionData.subject);
    
    this.currentQuestion = questionData;
    this.pendingQuestions.push(questionData);
    
    // Keep only last 10 questions
    if (this.pendingQuestions.length > 10) {
      this.pendingQuestions = this.pendingQuestions.slice(-10);
    }
    
    // Send to main window for display
    if (this.mainWindow) {
      this.mainWindow.webContents.send('question-detected', questionData);
    }
    
    // Show overlay with question context
    await this.showOverlay();
    
    // Send question data to overlay
    if (this.overlayWindow) {
      this.overlayWindow.webContents.send('question-detected', questionData);
    }
    
    // Sync to dashboard
    if (this.dashboardSync) {
      await this.dashboardSync.logQuestionDetection(questionData);
    }
    
    logger.success('Question detection handled successfully');
  }

  handleModeChange(isPracticeMode) {
    console.log(`🎯 Mode changed: ${isPracticeMode ? 'Practice' : 'Test'}`);
    
    if (!isPracticeMode) {
      // Test mode - disable all assistance
      this.stopMonitoring();
      this.hideOverlay();
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: 'Test Mode Detected',
        message: 'Bonsai SAT Assistant has been disabled during the actual test to maintain exam integrity.',
        buttons: ['OK']
      });
    }
  }

  async getAIHelp(questionText, helpType, questionData = {}) {
    logger.info(`🤖 Getting AI help: ${helpType}`);
    
    try {
      if (!this.aiService || !this.aiService.isReady()) {
        throw new Error('AI Service not configured. Please set your OpenAI API key in settings.');
      }
      
      let result;
      
      switch (helpType) {
        case 'analyze':
          result = await this.aiService.analyzeQuestion(questionText, questionData);
          break;
        case 'hint':
          result = await this.aiService.getHint(questionText, questionData);
          break;
        case 'concept':
          result = await this.aiService.explainConcept(questionText, questionData);
          break;
        case 'solution':
          result = await this.aiService.getSolution(questionText, questionData);
          break;
        default:
          result = await this.aiService.analyzeQuestion(questionText, questionData);
      }
      
      if (result.success) {
        // Update usage stats
        const usage = store.get('usage');
        usage.questionsHelped += 1;
        store.set('usage', usage);
        
        // Sync to dashboard
        if (this.dashboardSync) {
          await this.dashboardSync.logAIInteraction({
            questionText,
            helpType,
            response: result,
            timestamp: Date.now()
          });
        }
        
        logger.success(`AI help provided: ${helpType}`);
      }
      
      return result;
      
    } catch (error) {
      logger.logError('getAIHelp', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  showMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  async showOverlay() {
    if (!this.overlayWindow) {
      await this.createOverlayWindow();
    }
    this.overlayWindow.show();
    this.overlayWindow.focus();
  }

  hideOverlay() {
    if (this.overlayWindow) {
      this.overlayWindow.hide();
    }
  }

  toggleOverlay() {
    if (this.overlayWindow && this.overlayWindow.isVisible()) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  toggleMonitoring() {
    if (this.isMonitoring) {
      this.stopMonitoring();
    } else {
      this.startMonitoring();
    }
  }

  triggerQuickHelp() {
    if (this.currentQuestion) {
      this.showOverlay();
      // Send quick help request to overlay
      if (this.overlayWindow) {
        this.overlayWindow.webContents.send('trigger-quick-help');
      }
    }
  }

  openSettings() {
    this.showMainWindow();
    if (this.mainWindow) {
      this.mainWindow.webContents.send('navigate-to', 'settings');
    }
  }

  openHelp() {
    const { shell } = require('electron');
    shell.openExternal('https://bonsaiprepagent.vercel.app/help');
  }

  cleanup() {
    console.log('🧹 Cleaning up...');
    
    globalShortcut.unregisterAll();
    
    if (this.bluebookMonitor) {
      this.bluebookMonitor.stop();
    }
    
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

// Create and initialize the app
const bonsaiApp = new BonsaiSATDesktop();

// Handle app startup
if (app.isReady()) {
  bonsaiApp.initialize();
} else {
  app.whenReady().then(() => bonsaiApp.initialize());
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus existing instance
    bonsaiApp.showMainWindow();
  });
}

module.exports = BonsaiSATDesktop;