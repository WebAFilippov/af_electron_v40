import { ipcRenderer } from 'electron/renderer'

import { channels } from '../../shared/types'
import { ISettingsApp } from './types'

export const settings_app = {
  getSettingsByProperty: (value) => ipcRenderer.invoke(channels.settings_get_by_property, value),
  setAutoLaunch: (value) => ipcRenderer.invoke(channels.settings_set_autolaunch, value),
  setStartMinimized: (value) => ipcRenderer.invoke(channels.settings_set_startMinimaze, value),
  setCheckForUpdatesOnStartup: (value) => ipcRenderer.invoke(channels.settings_set_checkForUpdatesOnStartup, value)
} satisfies ISettingsApp
