export const channels = {
  app_started: 'app:started',

  settings_set_autolaunch: 'settings:setAutoLaunch',
  settings_set_startMinimaze: 'settings:setStartMinimized',
  settings_update_systemTheme: 'settings:update_systemTheme',
  settings_set_theme: 'settings:set_theme',
  settings_set_language: 'settings:set_language',

  window_updated: 'window:state',
  window_fullscreen: 'window:toggle-fullscreen',
  window_minimaze: 'window:minimize',
  window_maximaze: 'window:maximize',
  window_close: 'window:close'
} as const

export interface ISettings {
  version: string
  autoLaunch: boolean
  startMinimized: boolean
  language: 'en' | 'ru'
  theme: {
    mode: 'system' | 'dark' | 'light'
    darken: boolean
  }
}

export interface IWindow {
  minimize: boolean
  maximize: boolean
  fullscreen: boolean
  show: boolean
}

export interface AppStarted {
  settings: ISettings
}
