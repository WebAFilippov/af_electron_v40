import type { BrowserWindow } from 'electron'

import { ipcWindow } from '@/modules/window/window.controller'
import { ipcSettings } from '@/modules/settings/controller'
import { ipci18next } from '@/modules/i18next/i18next.controller'

export const ipcRegister = (window: BrowserWindow): void => {
  ipci18next()
  ipcWindow(window)
  ipcSettings()
}
