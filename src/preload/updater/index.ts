import { ipcRenderer } from 'electron/renderer'
import { IUpdaterApp } from './types'

export const updater_app = {
  onUpdateData: (callback) => {
    ipcRenderer.on('update_data', (_event, data: UpdateDataDto) => callback(data))
  },
  successfulUpdate: () => ipcRenderer.invoke('successful_update'),
  checkForUpdates: () => ipcRenderer.invoke('checking_for_update'),
  retryDownload: () => ipcRenderer.send('retry_checking_for_update'),
  startDownload: () => ipcRenderer.send('start_download'),
  installNow: () => ipcRenderer.send('install_now'),
  installOnQuit: () => ipcRenderer.send('install_on_quit')
} satisfies IUpdaterApp
