import { ipcRenderer } from 'electron/renderer'
import { IThemeApp } from './types'
import { channels, ThemeProps } from '../../shared/types'

export const theme_app = {
  setTheme: (mode) => ipcRenderer.invoke(channels.settings_set_theme, mode),
  onUpdateSystemTheme: (callback) =>
    ipcRenderer.on(channels.settings_update_systemTheme, (_, theme: ThemeProps) => callback(theme))
} satisfies IThemeApp
