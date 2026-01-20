import { nativeTheme } from 'electron/main'
import { ISettings } from '../../../shared/types'
import { settingsStore } from './settings.store'

export enum windowBackgroundColor {
  DARK = '#09090b',
  LIGHT = '#ffffff'
}

export const setAutoLaunch = (value: boolean): void => {
  settingsStore.set('autoLaunch', value)
}
export const setStartMinimized = (value: boolean): void => {
  settingsStore.set('startMinimized', value)
}
export const setLanguage = (value: ISettings['language']): void => {
  settingsStore.set('language', value)
}
export const setTheme = (mode: ISettings['theme']['mode']): ISettings['theme'] => {
  settingsStore.set('theme.mode', mode)

  switch (mode) {
    case 'system':
      if (nativeTheme.shouldUseDarkColors) {
        settingsStore.set('theme.darken', true)
      } else {
        settingsStore.set('theme.darken', false)
      }
      break
    case 'light':
      settingsStore.set('theme.darken', false)
      break
    case 'dark':
      settingsStore.set('theme.darken', true)
      break
  }

  return settingsStore.get('theme')
}
export const updateSystemTheme = (
  darken: ISettings['theme']['darken']
): ISettings['theme'] | null => {
  const theme = settingsStore.get('theme')
  if (theme.mode !== 'system') return null

  settingsStore.set('theme.darken', darken)

  return settingsStore.get('theme')
}
