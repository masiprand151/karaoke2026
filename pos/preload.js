const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  closeApp: () => ipcRenderer.send("app:close"),
  on(channel, callback) {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },
});
