import i18next, { i18n, InitOptions } from 'i18next'
import FsBackend from 'i18next-fs-backend'

import { i18nextStore } from './i18next.store'

import { AppLanguage, SUPPORTED_LANGUAGES } from '../../../shared/types'
import { Config } from '@/shared/config'
import { join } from 'path'

export const i18nextInit = async (): Promise<i18n> => {
  const currentLanguage = i18nextStore.get('language', 'ru') as AppLanguage

  const options: InitOptions = {
    debug: false,
    lng: currentLanguage,
    fallbackLng: 'en',
    ns: 'main',
    defaultNS: 'main',
    fallbackNS: 'main',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    backend: {
      loadPath: join(Config.pathResources, 'locales/{{lng}}/{{ns}}.json')
    },
    interpolation: {
      escapeValue: false
    },
    returnNull: false,
    returnEmptyString: false,
    cleanCode: true,
    load: 'languageOnly'
  }

  await i18next.use(FsBackend).init(options)

  return i18next
}

export const getLanguage = (): AppLanguage => {
  return i18nextStore.get('language') as AppLanguage
}

export const setLanguage = (language: AppLanguage): AppLanguage => {
  try {
    if (i18next.isInitialized) {
      i18nextStore.set('language', language)
      i18next.changeLanguage(language)
      return language
    }
    throw new Error('Not setted language in store')
  } catch {
    throw new Error('Not setted language in store')
  }
}
