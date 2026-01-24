import type { ElectronAPI } from '@electron-toolkit/preload'
import type { AppStarted, ISettings, IWindow } from '../shared/types'

export interface Api {
  // === App ===
  appStarted: () => Promise<AppStarted>

  // === Settings ===
  settingsSetAutoLaunch: (value: boolean) => Promise<boolean>
  settingSetStartMininaze: (value: boolean) => Promise<boolean>
  settingsUpdateSystemTheme: (callback: (theme: ISettings['theme']) => void) => void
  settingsSetTheme: (mode: ISettings['theme']['mode']) => Promise<ISettings['theme']>
  settingsSetLanguage: (mode: ISettings['language']) => void

  // === Window ===
  windowState: (callback: (state: IWindow) => void) => void
  windowToggleFullScreen: () => void
  windowMinimaze: () => void
  windowMaximaze: () => void
  windowClose: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
