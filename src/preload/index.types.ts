import type { ElectronAPI } from '@electron-toolkit/preload'
import type { AppLanguage, AppStarted, ISettings, IWindow } from '../shared/types'

export interface Api {
  // === App ===
  appStarted: () => Promise<AppStarted>
  // === Settings ===
  settingsSetAutoLaunch: (value: boolean) => Promise<boolean>
  settingSetStartMininaze: (value: boolean) => Promise<boolean>
  settingsUpdateSystemTheme: (callback: (theme: ISettings['theme']) => void) => void
  settingsSetTheme: (mode: ISettings['theme']['mode']) => Promise<ISettings['theme']>
  // === i18next ===
  i18nextChangeLanguage: (language: AppLanguage) => Promise<AppLanguage>
  i18nextGetLanguage: () => Promise<AppLanguage>
  i18nextGetResources: (lang: AppLanguage) => Promise<any>
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
