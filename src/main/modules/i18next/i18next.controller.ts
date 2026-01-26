import { ipcMain } from 'electron/main'
import { channels } from '../../../shared/types'
import { getLanguage, setLanguage } from './i18next.service'

export const ipci18next = (): void => {
  ipcMain.handle(channels.i18next_change_language, (_, language) => {
    return setLanguage(language)
  })

  ipcMain.handle(channels.i18next_get_language, () => {
    return getLanguage()
  })
}
