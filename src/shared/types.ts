import { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater'

export const channels = {
  app_started: 'app:started',

  settings_set_autolaunch: 'settings:setAutoLaunch',
  settings_set_startMinimaze: 'settings:setStartMinimized',
  settings_update_systemTheme: 'settings:update_systemTheme',
  settings_set_theme: 'settings:set_theme',
  settings_set_language: 'settings:set_language',
  settings_set_checkUpdateOnStart: 'settings:set_checkUpdateOnStart',

  i18next_change_language: 'i18next:change_language',
  i18next_get_language: 'i18next:get_language',
  i18next_get_resources: 'i18next:get_resources',

  window_updated: 'window:state',
  window_fullscreen: 'window:toggle-fullscreen',
  window_minimaze: 'window:minimize',
  window_maximaze: 'window:maximize',
  window_close: 'window:close'
} as const

export interface WindowAppProps {
  minimize: boolean
  maximize: boolean
  fullscreen: boolean
  show: boolean
}

export interface SettingsProps {
  version: string
  autoLaunch: boolean
  startMinimizedOnStart: boolean
  checkUpdateOnStart: boolean
}

export type LanguageApp = 'ru' | 'en' | 'be' | 'uk' | 'kk'
export const SUPPORTED_LANGUAGES: LanguageApp[] = ['ru', 'en', 'be', 'uk', 'kk']

export type ThemeProps = {
  mode: 'system' | 'dark' | 'light'
  darken: boolean
}

export type UpdateStatusDto =
  | 'idle'
  | 'error'
  | 'checking-for-update'
  | 'update-available'
  | 'update-not-available'
  | 'update-downloaded'
  | 'download-progress'

export type UpdateDataDto =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      data: {
        error: Error
        message: string | undefined
      }
    }
  | {
      status: 'checking-for-update'
    }
  | { status: 'update-available'; data: UpdateInfo }
  | { status: 'update-not-available'; data: UpdateInfo }
  | { status: 'update-downloaded'; data: UpdateDownloadedEvent }
  | { status: 'download-progress'; data: ProgressInfo }
