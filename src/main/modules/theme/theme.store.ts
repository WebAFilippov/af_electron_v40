import Store from 'electron-store'
import { Theme } from '../../../shared/types'

export const themeStore = new Store<Theme>({
  name: '123',
  defaults: {
    mode: 'system',
    darken: false
  }
})
