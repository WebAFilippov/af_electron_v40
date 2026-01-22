import Store from 'electron-store'
import { ISettings } from '../../../shared/types'
import { app } from 'electron'
import yaml from 'js-yaml'
import { nativeTheme } from 'electron/main'

export const settingsStore = new Store<ISettings>({
  name: 'settings',
  defaults: {
    version: app.getVersion(),
    autoLaunch: true,
    startMinimized: false,
    language: 'ru',
    theme: {
      mode: 'system',
      darken: nativeTheme.shouldUseDarkColors
    }
  },
  fileExtension: 'yaml',
  serialize: yaml.dump,
  deserialize: yaml.load
})
