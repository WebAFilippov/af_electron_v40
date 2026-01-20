import { app, ipcMain } from 'electron'
import { channels } from '../../shared/types'
import { settingsStore } from '@/modules/settings/settings.store'

export const ipcAppStarted = (): void => {
  const currentVersion = app.getVersion()
  if (currentVersion !== settingsStore.get('version')) settingsStore.set('version', currentVersion)

  ipcMain.handle(channels.app_started, () => {
    return { settings: settingsStore.store }
  })
}
