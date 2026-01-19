import { Api } from './index.types'
import { electronAPI } from '@electron-toolkit/preload'

import { contextBridge, ipcRenderer } from 'electron'
import { IPCChannels, Theme, ThemeMode, WindowState } from '../shared/types'

const api = {
  // === App ===
  appStarted: () => ipcRenderer.invoke(IPCChannels.APP_STARTED),
  // === Window ===
  windowState: (callback) => {
    ipcRenderer.on(IPCChannels.STATE, (_, state: WindowState) => callback(state))
  },
  windowToggleFullScreen: () => ipcRenderer.send(IPCChannels.TOGGLE_FULLSCREEN),
  windowMinimaze: () => ipcRenderer.send(IPCChannels.MINIMIZE),
  windowMaximaze: () => ipcRenderer.send(IPCChannels.MAXIMIZE),
  windowClose: () => ipcRenderer.send(IPCChannels.CLOSE),

  //  === i18n ===
  i18nGetLanguage: () => ipcRenderer.invoke(IPCChannels.GET_LANGUAGE),
  i18nSetLanguage: (language) => ipcRenderer.send(IPCChannels.SET_LANGUAGE, language),

  // === Theme ===
  updateSystemTheme: (callback) => {
    ipcRenderer.on(IPCChannels.UPDATE_SYSTEM_THEME, (_, state: Theme) => callback(state))
  },
  // getTheme: () => ipcRenderer.invoke(IPCChannels.GET_THEME),
  setTheme: (mode: ThemeMode) => ipcRenderer.invoke(IPCChannels.SET_THEME, mode)
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
