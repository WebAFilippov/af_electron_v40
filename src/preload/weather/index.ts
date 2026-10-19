import { ipcRenderer } from 'electron/renderer'

import { channels, type Location } from '@/shared_app/types'
import type { IWeatherApp } from './types'

export const weather_app = {
  get: () => ipcRenderer.invoke(channels.weather_get),
  refresh: () => ipcRenderer.invoke(channels.weather_refresh),
  setLocation: (location: Location | null) => ipcRenderer.invoke(channels.weather_set_location, location)
} satisfies IWeatherApp
