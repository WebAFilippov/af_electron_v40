import { ipcMain } from 'electron/main'

import { channels, type Location } from '@/shared_app/types'
import { logger } from '@/shared/utils/logger'
import { fetchWeather, getWeather, setWeatherLocation } from './service'
import { settingsStore } from '../settings/store'

/**
 * Weather IPC.
 *
 * The city is persisted here rather than in the renderer so that the main process
 * can keep fetching while the window is closed — a display device expects a
 * current forecast regardless of the UI state.
 */

/** Rejects anything that is not shaped like a Location, so a bad payload cannot be stored. */
const isLocation = (value: unknown): value is Location => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.latitude === 'number' &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === 'number' &&
    Number.isFinite(candidate.longitude) &&
    typeof candidate.city === 'string' &&
    typeof candidate.country === 'string'
  )
}

export const ipcWeather = (): void => {
  ipcMain.handle(channels.weather_get, () => getWeather())

  ipcMain.handle(channels.weather_refresh, async () => ({ data: await fetchWeather(true) }))

  ipcMain.handle(channels.weather_set_location, async (_event, value: unknown) => {
    if (value !== null && !isLocation(value)) {
      logger.warn('Rejected malformed weather location')
      return { data: null, pending: false, error: 'invalid-location' }
    }

    const next = value as Location | null
    settingsStore.set('weatherLocation', next)

    return setWeatherLocation(next)
  })
}
