import { BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { getTheme, setTheme } from './theme.service'
import { IPCChannels, ThemeMode } from '../../../shared/types'
import { themeStore } from './theme.store'

export const ThemeControllerIPC = (window: BrowserWindow): void => {
  nativeTheme.on('updated', () => {
    const theme = getTheme()
    if (theme.mode !== 'system') return

    themeStore.set('darken', nativeTheme.shouldUseDarkColors)

    window.webContents.send(IPCChannels.UPDATE_SYSTEM_THEME, {
      mode: theme.mode,
      darken: nativeTheme.shouldUseDarkColors
    })
  })

  ipcMain.handle(IPCChannels.SET_THEME, async (_, mode: ThemeMode) => {
    return setTheme(window, mode)
  })

  ipcMain.handle(IPCChannels.GET_THEME, () => {
    return getTheme()
  })
}
