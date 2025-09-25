const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialog methods
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Pipeline controls
  onPipelineStart: (callback) => ipcRenderer.on('pipeline-start', callback),
  onPipelineStop: (callback) => ipcRenderer.on('pipeline-stop', callback),
  onClearCache: (callback) => ipcRenderer.on('clear-cache', callback),
  
  // Configuration management
  onImportConfig: (callback) => ipcRenderer.on('import-config', callback),
  onExportConfig: (callback) => ipcRenderer.on('export-config', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // System information
  platform: process.platform,
  
  // File system access (restricted)
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});

// Prevent access to Node.js APIs
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});