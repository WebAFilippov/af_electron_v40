import Store from 'electron-store'
import { nativeTheme } from 'electron/main'
import { app } from 'electron'
import type { ISettings } from '../../../shared/types'
import { parse, stringify } from 'yaml'

export const settingsStore = new Store<ISettings>({
  name: 'settings',
  defaults: {
    version: app.getVersion(),
    autoLaunch: true,
    startMinimized: false,
    theme: {
      mode: 'system',
      darken: nativeTheme.shouldUseDarkColors
    }
  },
  fileExtension: 'yaml',
  serialize: (data) => stringify(data, { lineWidth: 0 }),
  deserialize: (str: string) => parse(str) as ISettings
})

// import bin from '../../resources/hello.exe?asset&asarUnpack'
// import jsonFile from '../../../../resources/locale/ru.json?commonjs-external&asset'
