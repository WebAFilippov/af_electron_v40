import { LanguageProps } from '@/shared_app/types'
import Store from 'electron-store'

export const i18nextStore = new Store<LanguageProps>({
  name: 'i18next',
  defaults: {
    language: 'ru'
  }
})
