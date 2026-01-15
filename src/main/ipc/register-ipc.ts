import { I18nControllerIPC } from '@/modules/i18n/i18n.contollers'
import { BrowserWindow } from 'electron'
import { AppStartedIPC } from './app-started'
import { ThemeControllerIPC } from '@/modules/theme/theme.controller'
import { registerWindowIPC } from '@/modules/window/window.controller'

export const RegisterIPC = (window: BrowserWindow): void => {
  AppStartedIPC()

  I18nControllerIPC()
  ThemeControllerIPC(window)
  registerWindowIPC(window)
}
