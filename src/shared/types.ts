export const IPCChannels = {
  APP_STARTED: 'app:started',

  STATE: 'window:state',
  TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  MINIMIZE: 'window:minimize',
  MAXIMIZE: 'window:maximize',
  CLOSE: 'window:close',

  GET_LANGUAGE: 'i18n:getLanguage',
  SET_LANGUAGE: 'i18n:setLanguage',

  UPDATE_SYSTEM_THEME: 'theme:update',
  GET_THEME: 'theme:get',
  SET_THEME: 'theme:set'
} as const

export type Language = 'en' | 'ru'

export type ThemeMode = 'system' | 'dark' | 'light'
export type Theme = {
  mode: ThemeMode
  darken: boolean
}

export type SettingsStore = {
  isAutoStart: boolean
  isStartMinimized: boolean
}

export interface AppStarted {
  language: Language
  theme: Theme
}

export interface WindowState {
  minimize: boolean
  maximize: boolean
  fullscreen: boolean
  show: boolean
}
