const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

const isDev = process.env.NODE_ENV === 'development'; 

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false, // Temporarily disable for debugging input issues
      allowRunningInsecureContent: true,
      experimentalFeatures: true // Enable for better compatibility
    },
    icon: path.join(__dirname, 'assets/icon.png'), // fallback icon
    title: 'React Vault Manager',
    show: false, // Don't show until ready
    autoHideMenuBar: true, // Hide menu bar for cleaner look
    titleBarStyle: 'default', // Use native title bar
    frame: true, // Keep the native frame for better desktop integration
    resizable: true, // Allow resizing
    center: true, // Center on screen
    backgroundColor: '#1a1a1a' // Dark background like your app
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Only open dev tools if specifically requested (uncomment next line if needed)
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/electron/index.html'));
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle new window creation
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// IPC handlers for file operations (password vault functionality)
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Vault Files', extensions: ['vault', 'json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('dialog:saveFile', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Vault Files', extensions: ['vault'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
});

ipcMain.handle('fs:exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('fs:mkdir', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
});

ipcMain.handle('fs:unlink', async (event, filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
});

ipcMain.handle('path:join', (event, ...args) => {
  return path.join(...args);
});

ipcMain.handle('path:basename', (event, filePath) => {
  return path.basename(filePath);
});

ipcMain.handle('path:dirname', (event, filePath) => {
  return path.dirname(filePath);
});

ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

// Security: Prevent new window creation except for external links
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
