import { SettingsProps } from '@/shared_app/types'

export interface ISettingsApp {
  getSettingsByProperty: <K extends keyof SettingsProps>(key: K) => Promise<SettingsProps[K]>
  setAutoLaunch: (value: SettingsProps['autoLaunch']) => Promise<SettingsProps['autoLaunch']>
  setStartMinimized: (value: SettingsProps['startMinimized']) => Promise<SettingsProps['startMinimized']>
  setCheckForUpdatesOnStartup: (
    value: SettingsProps['checkForUpdatesOnStartup']
  ) => Promise<SettingsProps['checkForUpdatesOnStartup']>
}
