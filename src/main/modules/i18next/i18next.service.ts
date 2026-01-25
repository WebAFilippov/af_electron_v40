import i18next, { i18n, InitOptions } from 'i18next'
import FsBackend from 'i18next-fs-backend'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

import { i18nextStore } from './i18next.store'
import { Config } from '@/shared/config'
import { AppLanguage, SUPPORTED_LANGUAGES } from '../../../shared/types'

export const i18nextInit = async (): Promise<i18n> => {
  const currentLanguage = i18nextStore.get('language', 'ru') as AppLanguage

  const options: InitOptions = {
    debug: false,
    lng: currentLanguage,
    fallbackLng: 'ru',
    ns: 'main',
    defaultNS: 'main',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    backend: {
      loadPath: join(Config.pathResources, 'locales/{{lng}}/{{ns}}.json'),
      addPath: is.dev
        ? join(Config.pathResources, 'locales/{{lng}}/{{ns}}.missing.json') // в dev можно писать
        : undefined // в production write не нужен и не сработает
    },
    interpolation: {
      escapeValue: false
    },
    returnNull: false,
    returnEmptyString: false,
    cleanCode: true,
    saveMissing: is.dev,
    saveMissingTo: 'fallback',
    load: 'currentOnly'
  }

  await i18next.use(FsBackend).init(options)

  return i18next
}

export const getLanguage = (): AppLanguage => {
  return i18nextStore.get('language') as AppLanguage
}

export const setLanguage = (language: AppLanguage): boolean => {
  try {
    if (i18next.isInitialized) {
      i18nextStore.set('language', language)
      i18next.changeLanguage(language)
      return true
    }
    return false
  } catch {
    return false
  }
}
