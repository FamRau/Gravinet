const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App version (from main process — reliable in packaged AppImage)
  getVersion: () => ipcRenderer.invoke('get-version'),
  // PDF printing
  printPDF: (html, filename) => ipcRenderer.invoke('print-pdf', { html, filename }),

  // Native theme sync
  setNativeTheme: (theme) => ipcRenderer.invoke('set-native-theme', theme),

  // File-based data storage
  data: {
    getDataPath:    ()          => ipcRenderer.invoke('data:get-data-path'),
    readWorkspace:  ()          => ipcRenderer.invoke('data:read-workspace'),
    writeWorkspace: (data)      => ipcRenderer.invoke('data:write-workspace', data),
    readContacts:   ()          => ipcRenderer.invoke('data:read-contacts'),
    writeContacts:  (data)      => ipcRenderer.invoke('data:write-contacts', data),
    listProjects:   ()          => ipcRenderer.invoke('data:list-projects'),
    readProject:    (id)        => ipcRenderer.invoke('data:read-project', id),
    writeProject:   (id, data)  => ipcRenderer.invoke('data:write-project', id, data),
    deleteProject:  (id)        => ipcRenderer.invoke('data:delete-project', id),
  },
});
