const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mirror', {
  start: (options) => ipcRenderer.invoke('start-uxplay', options),
  stop: () => ipcRenderer.invoke('stop-uxplay'),
  getIP: () => ipcRenderer.invoke('get-ip'),
  openGuide: () => ipcRenderer.invoke('open-airplay-guide'),
  repositionMirrorWindow: (options) => ipcRenderer.invoke('reposition-mirror-window', options),
  openMirrorFrame: () => ipcRenderer.invoke('open-mirror-frame'),
  mirrorHostResized: (bounds) => ipcRenderer.invoke('mirror-host-resized', bounds),
  onStatus: (callback) => ipcRenderer.on('uxplay-status', (event, data) => callback(data)),
  onLog: (callback) => ipcRenderer.on('uxplay-log', (event, data) => callback(data)),
  onEmbedStatus: (callback) => ipcRenderer.on('mirror-embed-status', (event, data) => callback(data)),
  hidListPorts: () => ipcRenderer.invoke('hid-list-ports'),
  hidConnect: (options) => ipcRenderer.invoke('hid-connect', options),
  hidDisconnect: () => ipcRenderer.invoke('hid-disconnect'),
  hidSend: (command) => ipcRenderer.invoke('hid-send', command),
  onHidStatus: (callback) => ipcRenderer.on('hid-status', (event, data) => callback(data)),
});