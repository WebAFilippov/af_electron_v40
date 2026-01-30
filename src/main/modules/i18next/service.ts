import i18next, { InitOptions } from 'i18next'
import FsBackend from 'i18next-fs-backend'

import { i18nextStore } from './store'

import { Config } from '@/shared/config'
import { join } from 'path'
import { LanguageApp, SUPPORTED_LANGUAGES } from '@/shared_app/types'

export const i18nextInit = async (): Promise<void> => {
  const currentLanguage = i18nextStore.get('language', 'ru') as LanguageApp

  const options: InitOptions = {
    debug: false,
    lng: currentLanguage,
    fallbackLng: 'ru',
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
}

export const getLanguage = (): LanguageApp => {
  return i18nextStore.get('language')
}

export const setLanguage = (language: LanguageApp): LanguageApp => {
  try {
    if (i18next.isInitialized) {
      i18nextStore.set('language', language)
      i18next.changeLanguage(language)
      return language
    }
    throw new Error('i18next not initialized')
  } catch {
    throw new Error('Not setted language in store')
  }
}
