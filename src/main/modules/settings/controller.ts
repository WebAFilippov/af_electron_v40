import { settingsStore } from './store'
import {
  setAutoLaunch,
  setStartMinimized,
  setTheme,
  updateSystemTheme,
  windowBackgroundColor
} from './service'
import type { ISettings } from '../../../shared/types'
import { channels } from '../../../shared/types'
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron/main'

export const applyAutoLaunch = (): void => {
  const enable = settingsStore.get('autoLaunch')

  const args = enable ? ['--auto-launch'] : []

  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: enable && process.platform === 'darwin',
    path: process.execPath,
    args
  })
}
export const applyThemeToWindow = (window: BrowserWindow, theme: ISettings['theme']): void => {
  nativeTheme.themeSource = theme.mode
  window.setBackgroundColor(theme.darken ? windowBackgroundColor.DARK : windowBackgroundColor.LIGHT)
}

export const ipcSettings = (): void => {
  const [window] = BrowserWindow.getAllWindows()

  ipcMain.handle(channels.settings_set_autolaunch, (_event, value: boolean) => {
    const result = setAutoLaunch(value)
    applyAutoLaunch()

    return result
  })
  ipcMain.handle(channels.settings_set_startMinimaze, (_event, value: boolean) => {
    return setStartMinimized(value)
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
}
