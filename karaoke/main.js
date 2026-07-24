const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let isQuitting = false;
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:5173"); // Vite default port
  win.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();

      win.webContents.send("app:closing");
    }
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
    ipcMain.emit("close", true);
    app.quit();
  }
});

//
ipcMain.on("app:close", () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on("app:closing:done", () => {
  isQuitting = true;
  app.quit();
});
