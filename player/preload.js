const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  closeApp: () => ipcRenderer.send("app:close"),
  on(channel, callback) {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

  appClosingDone() {
    ipcRenderer.send("app:closing:done");
  },
  getSongs: (folderPath) => ipcRenderer.invoke("get-songs", folderPath),
  getSetting: () => ipcRenderer.invoke("setting:get"),
  getYoutube: (query) => ipcRenderer.invoke("youtube", query),
});
