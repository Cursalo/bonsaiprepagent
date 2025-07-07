const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App information
    getVersion: () => ipcRenderer.invoke('app-version'),
    
    // Window management
    resizeWindow: (options) => ipcRenderer.invoke('resize-window', options),
    showTutorWindow: () => ipcRenderer.invoke('show-tutor-window'),
    hideTutorWindow: () => ipcRenderer.invoke('hide-tutor-window'),
    quitApplication: () => ipcRenderer.invoke('quit-application'),
    
    // External URLs
    openExternal: (url) => ipcRenderer.invoke('open-external-url', url),
    
    // File dialogs
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    
    // Event listeners
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    onShowView: (callback) => ipcRenderer.on('show-view', callback),
    onStartTutoring: (callback) => ipcRenderer.on('start-tutoring-session', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    
    // Send events to main process
    send: (channel, data) => {
        // Whitelist channels for security
        const validChannels = [
            'view-changed',
            'bonsai-growth',
            'subscription-updated',
            'progress-update',
            'study-session-start',
            'study-session-end',
            'achievement-unlocked'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`Attempted to send message on invalid channel: ${channel}`);
        }
    }
});

// Expose Bonsai-specific APIs
contextBridge.exposeInMainWorld('bonsaiElectron', {
    // Bonsai SAT specific functionality
    startTutoringSession: () => ipcRenderer.invoke('start-tutoring-session'),
    endTutoringSession: () => ipcRenderer.invoke('end-tutoring-session'),
    
    // Progress tracking
    updateProgress: (progressData) => ipcRenderer.send('progress-update', progressData),
    saveStudySession: (sessionData) => ipcRenderer.invoke('save-study-session', sessionData),
    loadStudyHistory: () => ipcRenderer.invoke('load-study-history'),
    
    // AI assistance
    requestAIHelp: (context) => ipcRenderer.invoke('request-ai-help', context),
    
    // Settings
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    
    // Notifications
    showNotification: (title, body, options) => ipcRenderer.invoke('show-notification', { title, body, options }),
    
    // Analytics (privacy-focused)
    trackEvent: (eventName, properties) => ipcRenderer.send('track-event', { eventName, properties }),
    
    // Subscription management
    openSubscriptionPage: () => ipcRenderer.invoke('open-subscription-page'),
    
    // Glass-inspired features
    enableFloatingMode: () => ipcRenderer.invoke('enable-floating-mode'),
    disableFloatingMode: () => ipcRenderer.invoke('disable-floating-mode'),
    setWindowOpacity: (opacity) => ipcRenderer.invoke('set-window-opacity', opacity),
    
    // Context awareness (adapted from Glass)
    detectSATContext: () => ipcRenderer.invoke('detect-sat-context'),
    captureScreenContext: () => ipcRenderer.invoke('capture-screen-context'),
    
    // File operations for study materials
    exportProgress: () => ipcRenderer.invoke('export-progress'),
    importStudyMaterials: () => ipcRenderer.invoke('import-study-materials'),
    
    // Platform integration
    registerGlobalShortcuts: (shortcuts) => ipcRenderer.invoke('register-global-shortcuts', shortcuts),
    unregisterGlobalShortcuts: () => ipcRenderer.invoke('unregister-global-shortcuts'),
    
    // Development tools
    isDev: () => process.env.NODE_ENV === 'development',
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    
    // Event listeners for Bonsai-specific events
    onBonsaiGrowth: (callback) => ipcRenderer.on('bonsai-growth', callback),
    onAchievementUnlocked: (callback) => ipcRenderer.on('achievement-unlocked', callback),
    onStreakUpdated: (callback) => ipcRenderer.on('streak-updated', callback),
    onSubscriptionChanged: (callback) => ipcRenderer.on('subscription-changed', callback)
});

// Enhanced Glass-inspired context detection
contextBridge.exposeInMainWorld('glassContext', {
    // Screen analysis adapted from Glass
    analyzeCurrentScreen: () => ipcRenderer.invoke('analyze-current-screen'),
    detectSATQuestions: () => ipcRenderer.invoke('detect-sat-questions'),
    extractTextFromScreen: () => ipcRenderer.invoke('extract-text-from-screen'),
    
    // Platform-specific detection
    detectKhanAcademy: () => ipcRenderer.invoke('detect-khan-academy'),
    detectCollegeBoard: () => ipcRenderer.invoke('detect-college-board'),
    
    // Smart overlays
    createSmartOverlay: (options) => ipcRenderer.invoke('create-smart-overlay', options),
    hideSmartOverlay: () => ipcRenderer.invoke('hide-smart-overlay'),
    
    // AI-powered assistance
    getContextualHelp: (context) => ipcRenderer.invoke('get-contextual-help', context),
    provideSATHint: (questionContext) => ipcRenderer.invoke('provide-sat-hint', questionContext),
    explainConcept: (concept) => ipcRenderer.invoke('explain-concept', concept),
    
    // Real-time feedback
    onContextChange: (callback) => ipcRenderer.on('context-change', callback),
    onQuestionDetected: (callback) => ipcRenderer.on('question-detected', callback),
    onHelpRequested: (callback) => ipcRenderer.on('help-requested', callback)
});

// Security: Prevent access to Node.js APIs
delete window.require;
delete window.exports;
delete window.module;

// Development helpers
if (process.env.NODE_ENV === 'development') {
    contextBridge.exposeInMainWorld('devTools', {
        log: (...args) => console.log('[Renderer]', ...args),
        inspect: (obj) => console.log('[Renderer Inspect]', JSON.stringify(obj, null, 2)),
        performance: {
            mark: (name) => performance.mark(name),
            measure: (name, start, end) => performance.measure(name, start, end),
            getEntries: () => performance.getEntries()
        }
    });
}

// Initialize Glass-inspired features when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    // Add Glass-inspired blur effects
    const style = document.createElement('style');
    style.textContent = `
        .glass-effect {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-window {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .floating-tutor {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize Bonsai app state
    if (window.bonsaiSAT) {
        console.log('🌱 Bonsai SAT Electron integration initialized');
    }
});

// Handle uncaught errors
window.addEventListener('error', (event) => {
    console.error('Renderer process error:', event.error);
    ipcRenderer.send('renderer-error', {
        message: event.error.message,
        stack: event.error.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    ipcRenderer.send('renderer-error', {
        message: 'Unhandled promise rejection',
        reason: event.reason
    });
});