import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // === System Info ===
  getSystemInfo: (): Promise<unknown> => ipcRenderer.invoke('get-system-info'),
  getProcesses: (): Promise<unknown> => ipcRenderer.invoke('get-processes'),
  // === Display ===
  getDisplays: () => ipcRenderer.invoke('get_displays'),
  addedDisplay: (callback: (arg0: Electron.Display) => void) => {
    ipcRenderer.on('added_display', (_event, data: Electron.Display) => callback(data))
  },
  removedDisplay: (callback: (arg0: Electron.Display) => void) => {
    ipcRenderer.on('removed_display', (_event, data: Electron.Display) => callback(data))
  },
  displayMetricsChange: (
    callback: (arg0: { display: Electron.Display; changeMetrics: string[] }) => void
  ) => {
    ipcRenderer.on(
      'display-metrics-changed',
      (_event, data: { display: Electron.Display; changeMetrics: string[] }) => callback(data)
    )
  },

  // === Updater ===
  onUpdateData: (callback: (arg0: unknown) => void) => {
    ipcRenderer.on('update_data', (_event, data: unknown) => callback(data))
  },
  successfulUpdate: () => ipcRenderer.invoke('successful_update'),
  checkForUpdates: () => ipcRenderer.invoke('checking_for_update'),
  retryDowmload: () => ipcRenderer.send('retry_checking_for_update'),
  startDownload: () => ipcRenderer.send('start_download'),
  installNow: () => ipcRenderer.send('install_now'),
  installOnQuit: () => ipcRenderer.send('install_on_quit'),

  // === Window ===
  windowState: (callback: (arg0: unknown) => void) => {
    ipcRenderer.on('window_state', (_event, state: unknown) => callback(state))
  },
  updateWindowTheme: (theme: unknown) => ipcRenderer.send('update_theme', theme),
  getWindowTheme: () => ipcRenderer.invoke('get_theme'),
  toggleFullscreenWindow: () => ipcRenderer.send('toggle_fullscreen'),
  minimazeWindow: () => ipcRenderer.send('minimaze'),
  maximazeWindow: () => ipcRenderer.send('maximize'),
  closeWindow: () => ipcRenderer.send('close'),

  // === External ===
  openExternal: (url: unknown) => ipcRenderer.send('external_open', url),

  onUdpData: (callback: (arg0: unknown) => void) => {
    ipcRenderer.on('udp-data', (_event, data) => callback(data))
  },
  onMediaData: (callback: (arg0: unknown) => void) => {
    ipcRenderer.on('media-data', (_event, data) => callback(data))
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
