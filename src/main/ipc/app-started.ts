import { app, ipcMain } from 'electron'
import { channels } from '../../shared/types'
import { settingsStore } from '@/modules/settings/settings.store'
import { getLanguage } from '@/modules/i18next/i18next.service'

export const ipcAppStarted = (): void => {
  const currentVersion = app.getVersion()
  if (currentVersion !== settingsStore.get('version')) settingsStore.set('version', currentVersion)
  const language = getLanguage()

  ipcMain.handle(channels.app_started, () => {
    return { settings: settingsStore.store, language }
  })
}
