const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  if (process.env.NODE_ENV === 'production') {
    const index = path.join(__dirname, '../web/dist/index.html');
    win.loadFile(index).catch(console.error);
  } else {
    win.loadURL(devUrl).catch(console.error);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

