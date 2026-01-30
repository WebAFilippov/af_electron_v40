import { BrowserWindow, Tray } from 'electron/main'
import type { AppUpdater } from 'electron-updater'

import { ipcI18next } from '@/modules/i18next/controller'
import { ipcTheme } from '@/modules/theme'
import { ipcWindow } from '@/modules/window'
import { ipcUpdater } from '@/modules/auto-updater/controller'
import { ipcSettings } from '@/modules/settings/controller'

export const ipcRegister = (window: BrowserWindow, tray: Tray, updater: AppUpdater): void => {
  ipcWindow(window)
  ipcTheme(window)
  ipcI18next(window, tray)
  ipcSettings(window, updater)
  ipcUpdater(window, updater)
}
