import { ElectronAPI } from '@electron-toolkit/preload'
import { AppStarted, Language, Theme, ThemeMode, WindowState } from '../shared/types'

export interface Api {
  // === App ===
  appStarted: () => Promise<AppStarted>

  // === Window ===
  windowState: (callback: (state: WindowState) => void) => void
  windowToggleFullScreen: () => void
  windowMinimaze: () => void
  windowMaximaze: () => void
  windowClose: () => void

  //  === i18n ===
  i18nGetLanguage: () => Promise<Language>
  i18nSetLanguage: (language: Language) => void

  // === Theme ===
  updateSystemTheme: (callback: (state: Theme) => void) => void
  getTheme: () => Promise<Theme>
  setTheme: (mode: ThemeMode) => Promise<Theme>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
