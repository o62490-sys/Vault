const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialog operations
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: () => ipcRenderer.invoke('dialog:saveFile'),

  // File system operations
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  fileExists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
  makeDirectory: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:unlink', filePath),

  // Path utilities
  pathJoin: (...args) => ipcRenderer.invoke('path:join', ...args),
  pathBasename: (filePath) => ipcRenderer.invoke('path:basename', filePath),
  pathDirname: (filePath) => ipcRenderer.invoke('path:dirname', filePath),

  // App paths
  getAppPath: (name) => ipcRenderer.invoke('app:getPath', name),

  // SQLite database operations
  sqlite: {
    open: (dbPath) => ipcRenderer.invoke('sqlite:open', dbPath),
    run: (sql, params) => ipcRenderer.invoke('sqlite:run', sql, params),
    get: (sql, params) => ipcRenderer.invoke('sqlite:get', sql, params),
    all: (sql, params) => ipcRenderer.invoke('sqlite:all', sql, params),
  },

  // Platform info
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
});
