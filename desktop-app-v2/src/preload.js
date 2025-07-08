// Preload script for secure IPC communication

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bonsaiAPI', {
  // Chat interface
  toggleChat: () => ipcRenderer.invoke('toggle-chat'),
  
  // AI assistance
  getAIHelp: (data) => ipcRenderer.invoke('get-ai-help', data),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Conversation
  getConversation: () => ipcRenderer.invoke('get-conversation'),
  saveMessage: (message) => ipcRenderer.invoke('save-message', message),
  clearConversation: () => ipcRenderer.invoke('clear-conversation'),
  
  // Event listeners
  onFocusInput: (callback) => ipcRenderer.on('focus-input', callback),
  
  // Utility
  openExternal: (url) => {
    const { shell } = require('electron');
    shell.openExternal(url);
  }
});