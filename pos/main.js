const { BrowserWindow, app, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    x: 0,
    y: 0,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (!app.isPackaged) {
    // DEVELOPMENT
    win.loadURL("http://localhost:5173"); // Vite default port
  } else {
    // PRODUCTION / PORTABLE
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  ipcMain.on("app:close", () => {
    win.close();
    process.exit(1);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
