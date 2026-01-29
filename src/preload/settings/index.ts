import { ipcRenderer } from 'electron/renderer'

import { channels } from '../../shared/types'
import { ISettingsApp } from './types'

export const settings_app = {
  setAutoLaunch: (value) => ipcRenderer.invoke(channels.settings_set_autolaunch, value),
  setStartMinimazeOnStart: (value) => ipcRenderer.invoke(channels.settings_set_startMinimaze, value),
  setCheckUpdateOnStart: (value: boolean) =>
    ipcRenderer.invoke(channels.settings_set_checkUpdateOnStart, value)
} satisfies ISettingsApp
