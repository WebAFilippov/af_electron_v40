import { electronAPI, ElectronAPI } from '@electron-toolkit/preload'

import { ISettingsApp } from './settings/types'
import { contextBridge } from 'electron/renderer'
import { settings_app } from './settings'
import { window_app } from './window'
import { IWindowApp } from './window/types'
import { i18next_app } from './i18next'
import { II18next } from './i18next/types'
import { theme_app } from './theme'
import { IThemeApp } from './theme/types'
import { updater_app } from './updater'
import { IUpdaterApp } from './updater/types'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('settings_app', settings_app)
    contextBridge.exposeInMainWorld('window_app', window_app)
    contextBridge.exposeInMainWorld('i18next_app', i18next_app)
    contextBridge.exposeInMainWorld('theme_app', theme_app)
    contextBridge.exposeInMainWorld('updater_app', updater_app)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.settings_app = settings_app
  // @ts-ignore (define in dts)
  window.window_app = window_app
  // @ts-ignore (define in dts)
  window.i18next_app = i18next_app
  // @ts-ignore (define in dts)
  window.theme_app = theme_app
  // @ts-ignore (define in dts)
  window.updater_app = updater_app
}

declare global {
  interface Window {
    electron: ElectronAPI
    settings_app: ISettingsApp
    window_app: IWindowApp
    i18next_app: II18next
    theme_app: IThemeApp
    updater_app: IUpdaterApp
  }
}
