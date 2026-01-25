import Store from 'electron-store'
import { stringify, parse } from 'yaml'
import { AppLanguage } from '../../../shared/types'

export type AppLanguageStore = { language: AppLanguage }

export const i18nextStore = new Store<AppLanguageStore>({
  name: 'i18next',
  defaults: {
    language: 'ru'
  },
  fileExtension: 'yaml',
  serialize: (data) => stringify(data, { lineWidth: 0 }),
  deserialize: (str: string) => parse(str) as AppLanguageStore
})
