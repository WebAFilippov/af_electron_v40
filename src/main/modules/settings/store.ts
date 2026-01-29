import Store from 'electron-store'
import { app } from 'electron'

import { SettingsProps } from '@/shared_app/types'

export const settingsStore = new Store<SettingsProps>({
  name: 'settings',
  defaults: {
    version: app.getVersion(),
    autoLaunch: true,
    startMinimizedOnStart: false,
    checkUpdateOnStart: true
  }
})
