import i18next, { InitOptions } from 'i18next'
import { createI18nextIntegration } from '@withease/i18next'
import { AppLanguage, SUPPORTED_LANGUAGES } from '../../../../../shared/types'
import { initReactI18next } from 'react-i18next'
import { appStarted } from '@/shared/model'
import Backend from 'i18next-http-backend'
import { createEffect, createEvent, sample } from 'effector'

const createOptions = (lang: AppLanguage): InitOptions => {
  return {
    debug: true,
    initAsync: false,
    lng: lang,
    fallbackLng: 'en',
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
}

const { $t, $isReady, $instance, $language, changeLanguageFx } = createI18nextIntegration({
  instance: async () => {
    const language = (await window.api.i18nextGetLanguage()) ?? 'ru'
    const options = createOptions(language)

    const i18n = i18next.createInstance()
    await i18n.use(Backend).use(initReactI18next).init(options)
    return i18n
  },
  setup: appStarted
})

const setLanguageFx = createEffect<AppLanguage, AppLanguage>((lang) => {
  return window.api.i18nextChangeLanguage(lang)
})

const changeLanguage = createEvent<AppLanguage>()

sample({
  clock: changeLanguage,
  target: setLanguageFx
})

sample({
  clock: setLanguageFx.doneData,
  target: changeLanguageFx
})

export { $t, $isReady, $instance, $language, changeLanguage }
