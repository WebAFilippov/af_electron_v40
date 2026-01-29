import { ipcRenderer } from 'electron/renderer'
import { II18next } from './types'
import { channels } from '../../shared/types'

export const i18next_app = {
  changeLanguage: (language) =>
    ipcRenderer.invoke(channels.i18next_change_language, language),
  getLanguage: () => ipcRenderer.invoke(channels.i18next_get_language),
  getResources: (lang) => ipcRenderer.invoke(channels.i18next_get_resources, lang)
} satisfies II18next
