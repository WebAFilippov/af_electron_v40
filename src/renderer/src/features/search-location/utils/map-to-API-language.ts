import { LanguageApp } from '@/shared_app/types'

export const mapToAPILanguage = (lang: LanguageApp): string => {
  const supportedLanguages = ['en', 'ru']
  if (supportedLanguages.includes(lang)) {
    return lang
  }
  return 'ru'
}
