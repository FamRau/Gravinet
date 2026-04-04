const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printPDF: (html, filename) => ipcRenderer.invoke('print-pdf', { html, filename }),
  setNativeTheme: (theme) => ipcRenderer.invoke('set-native-theme', theme),
});
