import { app, BrowserWindow, ipcMain } from 'electron/main'

import { settingsStore } from './store'
import { channels, SettingsProps } from '@/shared_app/types'
import { getSettingsByProperty, setAutoLaunch, setCheckForUpdatesOnStartup, setStartMinimized } from './service'
import type { AppUpdater } from 'electron-updater'

export const applyAutoLaunch = (): void => {
  const enable = settingsStore.get('autoLaunch')

  const args = enable ? ['--auto-launch'] : []

  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: enable && process.platform === 'darwin',
    path: process.execPath,
    args
  })
}

export const ipcSettings = (window: BrowserWindow, updater: AppUpdater): void => {
  updater
  window.once('ready-to-show', () => applyAutoLaunch())

  ipcMain.handle(channels.settings_get_by_property, (_event, value: keyof SettingsProps) =>
    getSettingsByProperty(value)
  )

  ipcMain.handle(channels.settings_set_autolaunch, (_event, value: SettingsProps['autoLaunch']) => {
    const result = setAutoLaunch(value)
    applyAutoLaunch()

    return result
  })

  ipcMain.handle(channels.settings_set_startMinimaze, (_event, value: SettingsProps['startMinimized']) => {
    return setStartMinimized(value)
  })

  ipcMain.handle(
    channels.settings_set_checkForUpdatesOnStartup,
    (_event, value: SettingsProps['checkForUpdatesOnStartup']) => {
      return setCheckForUpdatesOnStartup(value)
    }
  )
}
