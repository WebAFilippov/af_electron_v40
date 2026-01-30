import { BrowserWindow, ipcMain, nativeTheme } from 'electron/main'

import { getTheme, setTheme, updateSystemTheme } from './service'
import { channels, ThemeProps } from '@/shared_app/types'
import { BACKGROUND_COLOR } from './store'

export const applyThemeToWindow = (window: BrowserWindow, theme: ThemeProps): void => {
  nativeTheme.themeSource = theme.mode
  window.setBackgroundColor(theme.darken ? BACKGROUND_COLOR.DARK : BACKGROUND_COLOR.LIGHT)
}

export const ipcTheme = (window: BrowserWindow) => {
  nativeTheme.on('updated', () => {
    const theme = updateSystemTheme(nativeTheme.shouldUseDarkColors)
    if (theme?.mode !== 'system') return

    applyThemeToWindow(window, theme)

    window.webContents.send(channels.theme_on_update, theme)
  })

  ipcMain.handle(channels.theme_get_theme, () => {
    return getTheme()
  })

  ipcMain.handle(channels.theme_set_theme, (_, mode: ThemeProps['mode']) => {
    const theme = setTheme(mode)

    applyThemeToWindow(window, theme)

    return theme
  })
}
