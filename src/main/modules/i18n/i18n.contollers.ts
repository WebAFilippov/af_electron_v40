import { ipcMain } from 'electron'
import { getLanguage, setLanguage } from './i18n.service'

import { updateTray } from '@/app/create-tray'
import { IPCChannels, Language } from '../../../shared/types'
import { updateWindow } from '@/app/create-window'

export function I18nControllerIPC(): void {
  ipcMain.handle(IPCChannels.GET_LANGUAGE, () => {
    return getLanguage()
  })

  ipcMain.on(IPCChannels.SET_LANGUAGE, (_event, language: Language) => {
    setLanguage(language)
    updateTray()
    updateWindow()
  })
}
