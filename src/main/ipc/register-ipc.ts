import type { BrowserWindow } from 'electron'
import { ipcAppStarted } from './app-started'
import { ipcWindow } from '@/modules/window/window.controller'
import { ipcSettings } from '@/modules/settings/settings.controller'
import { ipci18next } from '@/modules/i18next/i18next.controller'

export const ipcRegister = (window: BrowserWindow): void => {
  ipcAppStarted()

  ipci18next()
  ipcWindow(window)
  ipcSettings()
}
