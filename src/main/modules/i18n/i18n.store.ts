import Store from 'electron-store'
import { Language } from '../../../shared/types'

export type i18n = {
  language: Language
}

export const i18nStore = new Store<i18n>({
  name: 'store',
  defaults: {
    language: 'en'
  }
})
