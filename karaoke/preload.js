const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  closeApp: () => ipcRenderer.send("app:close"),
});
