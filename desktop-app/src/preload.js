// Preload script for secure IPC communication
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Usage stats
  getUsageStats: () => ipcRenderer.invoke('get-usage-stats'),
  
  // Monitoring
  startMonitoring: () => ipcRenderer.invoke('start-monitoring'),
  stopMonitoring: () => ipcRenderer.invoke('stop-monitoring'),
  getMonitoringStatus: () => ipcRenderer.invoke('get-monitoring-status'),
  
  // Overlay
  showOverlay: () => ipcRenderer.invoke('show-overlay'),
  hideOverlay: () => ipcRenderer.invoke('hide-overlay'),
  forceAnalyzeScreen: () => ipcRenderer.invoke('force-analyze-screen'),
  
  // AI Service
  testAIConnection: () => ipcRenderer.invoke('test-ai-connection'),
  getAIStatus: () => ipcRenderer.invoke('get-ai-status'),
  generatePracticeQuestions: (data) => ipcRenderer.invoke('generate-practice-questions', data),
  getStudyRecommendations: (data) => ipcRenderer.invoke('get-study-recommendations', data),
  
  // Screen capture testing
  testScreenCapture: () => ipcRenderer.invoke('test-screen-capture'),
  
  // Question analysis
  analyzeCurrentQuestion: () => ipcRenderer.invoke('analyze-current-question'),
  getAIHelp: (data) => ipcRenderer.invoke('get-ai-help', data),
  
  // Dashboard sync
  syncToDashboard: (data) => ipcRenderer.invoke('sync-to-dashboard', data),
  
  // Event listeners
  onQuestionDetected: (callback) => {
    ipcRenderer.on('question-detected', callback);
  },
  onNavigateTo: (callback) => {
    ipcRenderer.on('navigate-to', callback);
  },
  onTriggerQuickHelp: (callback) => {
    ipcRenderer.on('trigger-quick-help', callback);
  },
  onLiveStatusUpdate: (callback) => {
    ipcRenderer.on('live-status-update', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

console.log('🌱 Bonsai SAT: Preload script loaded');