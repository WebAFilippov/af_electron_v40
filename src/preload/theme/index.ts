import { ipcRenderer } from 'electron/renderer'

import { channels, ThemeProps } from '@/shared_app/types'
import { IThemeApp } from './types'

export const theme_app = {
  getTheme: () => ipcRenderer.invoke(channels.theme_get_theme),
  setTheme: (mode) => ipcRenderer.invoke(channels.theme_set_theme, mode),
  onUpdateSystemTheme: (callback) =>
    ipcRenderer.on(channels.theme_on_update, (_, theme: ThemeProps) => callback(theme))
} satisfies IThemeApp
