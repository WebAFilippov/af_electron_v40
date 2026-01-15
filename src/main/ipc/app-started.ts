import { ipcMain } from 'electron'
import { IPCChannels } from '../../shared/types'
import { getTheme } from '@/modules/theme/theme.service'
import { getLanguage } from '@/modules/i18n/i18n.service'

export const AppStartedIPC = (): void => {
  ipcMain.handle(IPCChannels.APP_STARTED, () => {
    const language = getLanguage()
    const theme = getTheme()
    console.log(theme, 'dsad')

    return {
      language,
      theme
    }
  })
}
