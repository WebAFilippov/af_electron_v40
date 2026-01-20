import Store from 'electron-store'
import { ISettings } from '../../../shared/types'
import { app } from 'electron'
import yaml from 'js-yaml'

export const settingsStore = new Store<ISettings>({
  name: 'settings',
  defaults: {
    version: app.getVersion(),
    autoLaunch: true,
    startMinimized: false,
    language: 'ru',
    theme: {
      mode: 'system',
      darken: false
    }
  },
  fileExtension: 'yaml',
  serialize: yaml.dump,
  deserialize: yaml.load
})
