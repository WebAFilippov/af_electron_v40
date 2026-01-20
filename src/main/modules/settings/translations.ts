import { settingsStore } from './settings.store'

export const t = (key: keyof (typeof translations)['ru']): string => {
  const lang = settingsStore.get('language')
  return translations[lang][key] ?? key
}

export const translations = {
  ru: {
    app_title: 'еффектори',
    tray_label: 'Показать / скрыть',
    tray_exit: 'Выход'
  },
  en: {
    app_title: 'Effectory',
    tray_label: 'Show / Hide',
    tray_exit: 'Quit'
  }
} as const
