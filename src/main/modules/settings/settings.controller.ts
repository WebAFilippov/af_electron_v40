import { app } from 'electron'
import { settingsStore } from './settings.store'

export const setAutoLaunch = (value?: boolean): void => {
  const enable = settingsStore.get('isAutoStart')

  app.setLoginItemSettings({
    openAtLogin: enable,
    path: process.execPath,
    args: enable ? ['--auto-launch'] : []
  })
}

export const setStartMinimized = (value: boolean): void => {
  settingsStore.set('isStartMinimized', value)
}
