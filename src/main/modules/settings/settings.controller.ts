import { settingsStore } from './settings.store'
import {
  setAutoLaunch,
  setLanguage,
  setStartMinimized,
  setTheme,
  updateSystemTheme,
  windowBackgroundColor
} from './settings.service'
import { channels, ISettings } from '../../../shared/types'
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron/main'
import { updateTray } from '@/app/create-tray'
import { updateWindow } from '@/app/create-window'

export const applyAutoLaunch = (): void => {
  const autoLaunch = settingsStore.get('autoLaunch')
  app.setLoginItemSettings({
    openAtLogin: autoLaunch,
    path: process.execPath,
    args: autoLaunch ? ['--auto-launch'] : []
  })
}
export const applyThemeToWindow = (window: BrowserWindow, theme: ISettings['theme']): void => {
  nativeTheme.themeSource = theme.mode
  window.setBackgroundColor(theme.darken ? windowBackgroundColor.DARK : windowBackgroundColor.LIGHT)
}

export const ipcSettings = (): void => {
  const [window] = BrowserWindow.getAllWindows()

  ipcMain.on(channels.settings_set_autolaunch, (_event, value: boolean) => {
    setAutoLaunch(value)
    applyAutoLaunch()
  })
  ipcMain.on(channels.settings_set_startMinimaze, (_event, value: boolean) => {
    setStartMinimized(value)
  })

  nativeTheme.on('updated', () => {
    const theme = updateSystemTheme(nativeTheme.shouldUseDarkColors)
    if (!theme) return

    applyThemeToWindow(window, theme)

    window.webContents.send(channels.settings_update_systemTheme, theme)
  })
  ipcMain.handle(channels.settings_set_theme, (_, mode: ISettings['theme']['mode']) => {
    const theme = setTheme(mode)
    applyThemeToWindow(window, theme)

    return theme
  })

  ipcMain.on(channels.settings_set_language, (_event, language: ISettings['language']) => {
    setLanguage(language)
    updateTray()
    updateWindow()
  })
}
