const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('truckWorkshopDesktop', {
  platform: process.platform,
  electronVersion: process.versions.electron,
})
