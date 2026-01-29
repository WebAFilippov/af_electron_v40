import { nativeTheme } from 'electron/main'


import { settingsStore } from './store'


export const setAutoLaunch = (value: boolean): boolean => {
  settingsStore.set('autoLaunch', value)
  return settingsStore.get('autoLaunch')
}
export const setStartMinimized = (value: boolean): boolean => {
  settingsStore.set('startMinimized', value)
  return settingsStore.get('startMinimized')
}

export const setTheme = (mode: SettingsProps['theme']['mode']): SettingsProps['theme'] => {
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
  darken: SettingsProps['theme']['darken']
): SettingsProps['theme'] | null => {
  const theme = settingsStore.get('theme')
  if (theme.mode !== 'system') return null

  settingsStore.set('theme.darken', darken)

  return settingsStore.get('theme')
}
