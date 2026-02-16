import { createQuery } from '@farfetched/core'
import { createEvent, sample } from 'effector'
import { toast } from 'sonner'
import { interval } from 'patronum'

import { $currentLocation } from '@/entities/location'
import { Location } from '@/shared_app/types'
import { WeatherResponse } from './types'

// Event to trigger weather refresh
export const refreshWeather = createEvent()

// Weather Query - Get current weather and forecast
export const weatherQuery = createQuery<Location[], WeatherResponse>({
  handler: async (location) => {
    const url = new URL('https://api.open-meteo.com/v1/forecast')

    // Location params
    url.searchParams.append('latitude', location.latitude.toString())
    url.searchParams.append('longitude', location.longitude.toString())

    // Current weatherF
    url.searchParams.append(
      'current',
      [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m'
      ].join(',')
    )

    // Hourly forecast (24 hours)
    url.searchParams.append(
      'hourly',
      [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'wind_speed_10m',
        'pressure_msl'
      ].join(',')
    )

    // Daily forecast (7 days)
    url.searchParams.append(
      'daily',
      [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max'
      ].join(',')
    )

    // Timezone
    url.searchParams.append('timezone', location.timezone)
    url.searchParams.append('forecast_days', '7')
    url.searchParams.append('past_days', '1')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    // console.log(await response.json());

    return response.json()
  }
})

// Show toast on weather error
sample({
  clock: weatherQuery.finished.failure,
  fn: ({ error }) => {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data'
    toast.error('Weather Update Failed', {
      description: errorMessage,
      duration: 5000
    })
    return error
  },
  target: []
})

// Auto-refresh every hour using interval
const { tick: hourlyTick } = interval({
  timeout: 15 * 60 * 1000, // 1 hour in milliseconds
  start: sample({
    clock: $currentLocation,
    filter: (location): location is Location => Boolean(location)
  }),
  stop: sample({
    clock: $currentLocation,
    filter: (location) => location === null
  })
})

// Refresh weather every hour
sample({
  clock: hourlyTick,
  source: $currentLocation,
  filter: (location): location is Location => Boolean(location),
  target: weatherQuery.start
})

// Fetch weather when location changes
sample({
  clock: $currentLocation,
  filter: (location): location is Location => Boolean(location),
  target: weatherQuery.start
})

// Manual refresh
sample({
  clock: refreshWeather,
  source: $currentLocation,
  filter: (location): location is Location => Boolean(location),
  target: weatherQuery.start
})

// Exports
export const $weatherData = weatherQuery.$data
export const $weatherPending = weatherQuery.$pending
export const $weatherError = weatherQuery.$error
