import { BrowserWindow } from 'electron'
import { ipcAppStarted } from './app-started'
import { ipcWindow } from '@/modules/window/window.controller'
import { ipcSettings } from '@/modules/settings/settings.controller'

export const ipcRegister = (window: BrowserWindow): void => {
  ipcAppStarted()

  ipcWindow(window)
  ipcSettings()
}
