const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { getConfig } = require("./lib");

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

ipcMain.handle("setting:get", async () => {
  return getConfig();
});
ipcMain.handle(
  "print-receipt",
  async (event, { htmlContent, printerTarget = null }) => {
    const config = getConfig();
    const win = new BrowserWindow({ show: false });
    await win.loadURL(
      "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent),
    );

    const printers = await win.webContents.getPrintersAsync();

    const targetPrinter = printers.find(
      (p) => p.name === config?.printers[printerTarget],
    );

    const deviceName = targetPrinter ? targetPrinter.name : null;

    return new Promise((resolve) => {
      win.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName,
        },
        async (success, errorType) => {
          if (!success) {
            console.error("Printer error:", errorType);
            resolve({
              success: false,
              message: "Gagal membuat PDF fallback!",
            });
          } else {
            resolve({
              success: true,
              message: "Print berhasil!",
            });
          }
          win.close();
        },
      );
    });
  },
);
