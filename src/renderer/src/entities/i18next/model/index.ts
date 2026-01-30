import { createEffect, createEvent, sample } from 'effector'
import { and, not } from 'patronum'
import i18next, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { createI18nextIntegration } from '@withease/i18next'

import { LanguageApp, SUPPORTED_LANGUAGES } from '@/shared_app/types'

const createOptions = (language: LanguageApp): InitOptions => {
  return {
    debug: true,
    initAsync: false,
    lng: language,
    fallbackLng: 'ru',
    ns: 'renderer',
    defaultNS: 'renderer',
    fallbackNS: 'renderer',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false
    },
    returnNull: true,
    returnEmptyString: false,
    cleanCode: true
  }
}

const setLanguageFx = createEffect<LanguageApp, LanguageApp>((lang) => {
  return window.i18next_app.changeLanguage(lang)
})

const initI18Next = createEvent()
const changeLanguage = createEvent<LanguageApp>()

const { $t, $isReady, $instance, $language, changeLanguageFx } = createI18nextIntegration({
  instance: async () => {
    const language = (await window.i18next_app.getLanguage()) ?? 'ru'
    const options = createOptions(language)

    const i18n = i18next.createInstance()
    await i18n.use(initReactI18next).init(options)

    for (const lang of SUPPORTED_LANGUAGES) {
      const resources = await window.i18next_app.getResources(lang)

      i18n.addResourceBundle(lang, 'renderer', resources, true, true)
    }

    return i18n
  },
  setup: initI18Next
})

sample({
  clock: changeLanguage,
  filter: and(not(setLanguageFx.pending), not(setLanguageFx.pending)),
  target: setLanguageFx
})

sample({
  clock: setLanguageFx.doneData,
  target: changeLanguageFx
})

export { $t, $isReady, $instance, $language, changeLanguage, initI18Next }

