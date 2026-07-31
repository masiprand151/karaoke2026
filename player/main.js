const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getSongsFromFolder } = require("./lib");

let isQuitting = false;
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 0,
    height: 0,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:5174");

  // Atur ukuran setelah konten siap
  win.once("ready-to-show", () => {
    win.setBounds({ x: 0, y: 0, width: 1024 * 2, height: 768 });
    win.show();
  });

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

ipcMain.handle("get-songs", async (event, folderPath) => {
  return getSongsFromFolder(folderPath);
});
