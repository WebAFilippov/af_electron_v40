import { Language } from '../../../shared/types'
import { i18nStore } from './i18n.store'

export function getLanguage(): Language {
  return i18nStore.get('language')
}

export function setLanguage(language: Language): void {
  i18nStore.set('language', language)
}
