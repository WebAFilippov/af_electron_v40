import { translations } from './translations'
import { getLanguage } from './i18n.service'

export const t = (key: keyof (typeof translations)['ru']): string => {
  const lang = getLanguage()
  return translations[lang][key] ?? key
}
