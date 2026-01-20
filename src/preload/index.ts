import { Api } from './index.types'
import { electronAPI } from '@electron-toolkit/preload'

import { contextBridge, ipcRenderer } from 'electron'
import { channels, ISettings, IWindow } from '../shared/types'

const api = {
  // === App ===
  appStarted: () => ipcRenderer.invoke(channels.app_started),
  // === Settings ===
  settingsSetAutoLaunch: (value) => ipcRenderer.send(channels.settings_set_autolaunch, value),
  settingSetStartMininaze: (value) => ipcRenderer.send(channels.settings_set_startMinimaze, value),
  settingsUpdateSystemTheme: (callback) => {
    ipcRenderer.on(channels.settings_update_systemTheme, (_, theme: ISettings['theme']) =>
      callback(theme)
    )
  },
  settingsSetTheme: (mode) => ipcRenderer.invoke(channels.settings_set_theme, mode),
  settingsSetLanguage: (mode) => ipcRenderer.send(channels.settings_set_language, mode),
  // === Window ===
  windowState: (callback) => {
    ipcRenderer.on(channels.window_updated, (_, state: IWindow) => callback(state))
  },
  windowToggleFullScreen: () => ipcRenderer.send(channels.window_fullscreen),
  windowMinimaze: () => ipcRenderer.send(channels.window_minimaze),
  windowMaximaze: () => ipcRenderer.send(channels.window_maximaze),
  windowClose: () => ipcRenderer.send(channels.window_close)
} satisfies Api

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
