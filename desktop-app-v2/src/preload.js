// Preload script for secure IPC communication

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bonsaiAPI', {
  // Chat interface
  toggleChat: () => ipcRenderer.invoke('toggle-chat'),
  
  // AI assistance (enhanced)
  getAIHelp: (data) => ipcRenderer.invoke('get-ai-help', data),
  
  // Behavior tracking
  getBehaviorMetrics: () => ipcRenderer.invoke('get-behavior-metrics'),
  getBehaviorPrediction: () => ipcRenderer.invoke('get-behavior-prediction'),
  
  // Screenshot analysis
  analyzeScreenshot: (screenshot) => ipcRenderer.invoke('analyze-screenshot', screenshot),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Conversation
  getConversation: () => ipcRenderer.invoke('get-conversation'),
  saveMessage: (message) => ipcRenderer.invoke('save-message', message),
  clearConversation: () => ipcRenderer.invoke('clear-conversation'),
  
  // Advanced features
  getSessionHistory: () => ipcRenderer.invoke('get-session-history'),
  getAIServiceStatus: () => ipcRenderer.invoke('get-ai-service-status'),
  
  // Event listeners
  onFocusInput: (callback) => ipcRenderer.on('focus-input', callback),
  onStruggleIndicator: (callback) => ipcRenderer.on('show-struggle-indicator', callback),
  onHelpAvailable: (callback) => ipcRenderer.on('show-help-available', callback),
  onProactiveOffer: (callback) => ipcRenderer.on('show-proactive-offer', callback),
  onProactiveHelp: (callback) => ipcRenderer.on('show-proactive-help', callback),
  
  // Utility
  openExternal: (url) => {
    const { shell } = require('electron');
    shell.openExternal(url);
  },
  
  // Screen capture for analysis
  captureScreen: async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          stream.getTracks().forEach(track => track.stop());
          
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL.split(',')[1]); // Return base64 without prefix
        };
      });
    } catch (error) {
      console.error('Screen capture failed:', error);
      return null;
    }
  }
});