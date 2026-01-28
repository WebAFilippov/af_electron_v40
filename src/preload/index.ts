import type { Api } from './index.types'
import { electronAPI } from '@electron-toolkit/preload'

import { contextBridge, ipcRenderer } from 'electron'
import type { ISettings, IWindow, UpdateDataDto } from '../shared/types'
import { channels } from '../shared/types'

const api = {
  // === App ===
  appStarted: () => ipcRenderer.invoke(channels.app_started),
  // === Settings ===
  settingsSetAutoLaunch: (value) => ipcRenderer.invoke(channels.settings_set_autolaunch, value),
  settingSetStartMininaze: (value) =>
    ipcRenderer.invoke(channels.settings_set_startMinimaze, value),
  settingsUpdateSystemTheme: (callback) => {
    ipcRenderer.on(channels.settings_update_systemTheme, (_, theme: ISettings['theme']) =>
      callback(theme)
    )
  },
  settingsSetTheme: (mode) => ipcRenderer.invoke(channels.settings_set_theme, mode),
  // === i18next ===
  i18nextChangeLanguage: (language) =>
    ipcRenderer.invoke(channels.i18next_change_language, language),
  i18nextGetLanguage: () => ipcRenderer.invoke(channels.i18next_get_language),
  i18nextGetResources: (lang) => ipcRenderer.invoke(channels.i18next_get_resources, lang),
  // === Window ===
  windowState: (callback) => {
    ipcRenderer.on(channels.window_updated, (_, state: IWindow) => callback(state))
  },
  windowToggleFullScreen: () => ipcRenderer.send(channels.window_fullscreen),
  windowMinimaze: () => ipcRenderer.send(channels.window_minimaze),
  windowMaximaze: () => ipcRenderer.send(channels.window_maximaze),
  windowClose: () => ipcRenderer.send(channels.window_close),
    // === Updater ===
  onUpdateData: (callback) => {
    ipcRenderer.on('update_data', (_event, data: UpdateDataDto) => callback(data))
  },
  successfulUpdate: () => ipcRenderer.invoke('successful_update'),
  checkForUpdates: () => ipcRenderer.invoke('checking_for_update'),
  retryDownload: () => ipcRenderer.send('retry_checking_for_update'),
  startDownload: () => ipcRenderer.send('start_download'),
  installNow: () => ipcRenderer.send('install_now'),
  installOnQuit: () => ipcRenderer.send('install_on_quit'),
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
