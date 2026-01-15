import { BrowserWindow, nativeTheme } from 'electron'
import { themeStore } from './theme.store'
import { Theme, ThemeMode } from '../../../shared/types'

export enum WindowBackgroundColor {
  dark = '#09090b',
  light = '#ffffff'
}

export const getTheme = (): Theme => {
  return { mode: themeStore.get('mode'), darken: themeStore.get('darken') }
}

export const setTheme = (window: BrowserWindow, mode: ThemeMode): Theme => {
  themeStore.set('mode', mode)

  switch (mode) {
    case 'system':
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'system'
        window.setBackgroundColor(WindowBackgroundColor.dark)
        themeStore.set('darken', nativeTheme.shouldUseDarkColors)
      } else {
        nativeTheme.themeSource = 'system'
        window.setBackgroundColor(WindowBackgroundColor.light)
        themeStore.set('darken', nativeTheme.shouldUseDarkColors)
      }
      break
    case 'light':
      nativeTheme.themeSource = 'light'
      window.setBackgroundColor(WindowBackgroundColor.light)
      themeStore.set('darken', false)
      break
    case 'dark':
      nativeTheme.themeSource = 'dark'
      window.setBackgroundColor(WindowBackgroundColor.dark)
      themeStore.set('darken', true)
      break
  }

  return {
    mode: themeStore.get('mode'),
    darken: themeStore.get('darken')
  }
}

export const applyTheme = (window: BrowserWindow, theme: Theme): void => {
  nativeTheme.themeSource = theme.mode

  const bgColor =
    theme.mode === 'dark' || (theme.mode === 'system' && nativeTheme.shouldUseDarkColors)
      ? WindowBackgroundColor.dark
      : WindowBackgroundColor.light

  window.setBackgroundColor(bgColor)
}
