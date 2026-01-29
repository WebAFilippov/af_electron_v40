import Store from 'electron-store'

import { ThemeProps } from '@/shared_app/types'
import { nativeTheme } from 'electron/main'

export enum BACKGROUND_COLOR {
  DARK = '#18181b',
  LIGHT = '#fafafa'
}

export const themeStore = new Store<ThemeProps>({
  name: 'theme',
  defaults: {
    mode: 'system',
    darken: nativeTheme.shouldUseDarkColors
  }
})
