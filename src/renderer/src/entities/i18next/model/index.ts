const options: InitOptions = {
  debug: true,
  initAsync: false,
  lng: 'ru',
  fallbackLng: 'ru',
  ns: 'renderer',
  defaultNS: 'renderer',
  supportedLngs: SUPPORTED_LANGUAGES,
  nonExplicitSupportedLngs: true,
  backend: {
    loadPath: 'locales/{{lng}}/{{ns}}.json',
    addPath: null
  },
  interpolation: {
    escapeValue: false
  },
  returnNull: true,
  returnEmptyString: false,
  cleanCode: true,
  load: 'currentOnly'
}

import i18next, { InitOptions } from 'i18next'
import { createI18nextIntegration } from '@withease/i18next'
import { SUPPORTED_LANGUAGES } from '../../../../../shared/types'
import { initReactI18next } from 'react-i18next'
import { appStarted } from '@/shared/model'
import Backend from 'i18next-http-backend';


const { $t, $isReady, $instance, $language, changeLanguageFx } = createI18nextIntegration({
  instance: async () => {
    const i18n = i18next.createInstance()
    await i18n.use(Backend).use(initReactI18next).init(options)
    return i18n
  },
  setup: appStarted
})

export { $t, $isReady, $instance, $language, changeLanguageFx }
