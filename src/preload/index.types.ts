import type { ElectronAPI } from '@electron-toolkit/preload'
import type { AppLanguage, AppStarted, ISettings, IWindow, UpdateDataDto } from '../shared/types'
import { UpdateCheckResult } from 'electron-updater'

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
  // === Updater ===
  onUpdateData: (callback: (data: UpdateDataDto) => void) => void
  successfulUpdate: () => Promise<{ version: string; updated: boolean }>
  checkForUpdates: () => Promise<UpdateCheckResult | null>
  retryDownload: () => void
  startDownload: () => void
  installNow: () => void
  installOnQuit: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
