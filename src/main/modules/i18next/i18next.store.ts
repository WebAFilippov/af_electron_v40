import Store from 'electron-store'
import { stringify, parse } from 'yaml'

export type AppLanguageStore = { language: AppLanguage }
export type AppLanguage = 'ru' | 'en' | 'be' | 'uk'
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['ru', 'en', 'be', 'uk']

export const i18nextStore = new Store<AppLanguageStore>({
  name: 'i18next',
  defaults: {
    language: 'ru'
  },
  fileExtension: 'yaml',
  serialize: (data) => stringify(data, { lineWidth: 0 }),
  deserialize: (str: string) => parse(str) as AppLanguageStore
})
