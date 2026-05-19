const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 460,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setAlwaysOnTop(true, 'floating');
}

// 桌面通知
ipcMain.handle('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body, silent: false });
    notification.show();
    return true;
  }
  return false;
});

// 窗口置顶切换
ipcMain.handle('set-always-on-top', (_, flag) => {
  mainWindow.setAlwaysOnTop(flag, 'floating');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
