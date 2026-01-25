import { ipcMain } from 'electron/main'
import { channels } from '../../../shared/types'
import { setLanguage } from './i18next.service'

export const ipci18next = (): void => {
  ipcMain.handle(channels.i18next_change_language, (_, language) => {
    return setLanguage(language)
  })
}
