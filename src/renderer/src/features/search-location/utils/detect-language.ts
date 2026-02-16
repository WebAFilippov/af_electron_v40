import { LanguageApp } from '@/shared_app/types'

const LANGUAGE_PRIORITY: { pattern: RegExp; lang: LanguageApp }[] = [
  { pattern: /[а-яА-ЯёЁ]/, lang: 'ru' },
  { pattern: /[a-zA-Z]/, lang: 'en' }
]

export const detectLanguage = (query: string): LanguageApp => {
  for (const { pattern, lang } of LANGUAGE_PRIORITY) {
    if (pattern.test(query)) {
      return lang
    }
  }
  return 'en'
}
