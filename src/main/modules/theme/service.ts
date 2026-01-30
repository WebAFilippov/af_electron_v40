import { ThemeProps } from '@/shared_app/types'
import { themeStore } from './store'
import { nativeTheme } from 'electron/main'

export const getTheme = (): ThemeProps => {
  return themeStore.store
}

export const setTheme = (mode: ThemeProps['mode']): ThemeProps => {
  themeStore.set('mode', mode)

  switch (mode) {
    case 'system':
      if (nativeTheme.shouldUseDarkColors) {
        themeStore.set('darken', true)
      } else {
        themeStore.set('darken', false)
      }
      break
    case 'light':
      themeStore.set('darken', false)
      break
    case 'dark':
      themeStore.set('darken', true)
      break
  }

  return themeStore.store
}

export const updateSystemTheme = (darken: ThemeProps['darken']): ThemeProps | null => {
  if (themeStore.get('mode') !== 'system') return null

  themeStore.set('darken', darken)

  return themeStore.store
}
