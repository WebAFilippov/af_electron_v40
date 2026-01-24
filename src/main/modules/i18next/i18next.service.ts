import i18next, { i18n, InitOptions } from 'i18next'
import FsBackend from 'i18next-fs-backend'
import path from 'path'

import { AppLanguage, i18nextStore, SUPPORTED_LANGUAGES } from './i18next.store'
import { Config } from '@/shared/config'
import { is } from '@electron-toolkit/utils'

export const i18nextInit = async (): Promise<i18n> => {
  const currentLanguage = i18nextStore.get('language', 'ru') as AppLanguage

  const options: InitOptions = {
    debug: false,
    lng: currentLanguage,
    fallbackLng: 'ru',
    ns: 'backend',
    defaultNS: 'backend',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    backend: {
      loadPath: path.join(Config.pathResources, 'locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(Config.pathResources, 'locales/{{lng}}/{{ns}}.missing.json')
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
