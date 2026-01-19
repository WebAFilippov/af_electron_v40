import Store from 'electron-store'
import { SettingsStore } from '../../../shared/types'

export const settingsStore = new Store<SettingsStore>({
  name: 'store',
  defaults: {
    isAutoStart: false,
    isStartMinimized: false
  }
})
