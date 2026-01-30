import { SettingsProps } from '@/shared_app/types'
import { settingsStore } from './store'

export const getSettings = (): SettingsProps => {
  return settingsStore.store
}

export const getSettingsByProperty = <T extends keyof SettingsProps>(property: T): SettingsProps[T] => {
  return settingsStore.get(property) as SettingsProps[T]
}

export const setAutoLaunch = (value: SettingsProps['autoLaunch']): SettingsProps['autoLaunch'] => {
  settingsStore.set('autoLaunch', value)
  return settingsStore.get('autoLaunch')
}

export const setStartMinimized = (value: SettingsProps['startMinimized']): SettingsProps['startMinimized'] => {
  settingsStore.set('startMinimized', value)
  return settingsStore.get('startMinimized')
}

export const setCheckForUpdatesOnStartup = (
  value: SettingsProps['checkForUpdatesOnStartup']
): SettingsProps['checkForUpdatesOnStartup'] => {
  settingsStore.set('checkForUpdatesOnStartup', value)
  return settingsStore.get('checkForUpdatesOnStartup')
}
