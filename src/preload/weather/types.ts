import type { Location, WeatherData, WeatherSnapshot } from '@/shared_app/types'

/**
 * Weather API exposed to the renderer.
 *
 * The payload types live in the shared contract, so main, preload and renderer all
 * describe the same shape.
 */
export interface IWeatherApp {
  get: () => Promise<WeatherSnapshot>
  refresh: () => Promise<{ data: WeatherData | null }>
  setLocation: (location: Location | null) => Promise<WeatherSnapshot>
}
