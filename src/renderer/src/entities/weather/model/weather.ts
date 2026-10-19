import { createEffect, createEvent, createStore, sample } from 'effector'
import { toast } from 'sonner'
import { interval } from 'patronum'

import type { Location, WeatherData, WeatherSnapshot } from '@/shared_app/types'

/**
 * Weather state.
 *
 * The request itself lives in the main process now: it has to keep working while
 * the window is closed, and the same payload feeds the display device. The renderer
 * only mirrors the result, so there is one cache instead of two that drift apart.
 */

const fetchWeatherFx = createEffect<void, WeatherSnapshot>(() => window.weather_app.get())
const refreshWeatherFx = createEffect<void, { data: WeatherData | null }>(() => window.weather_app.refresh())
const setWeatherLocationFx = createEffect<Location | null, WeatherSnapshot>((location) =>
  window.weather_app.setLocation(location)
)

/** Triggers a forced refresh, bypassing the 15-minute cache in the main process. */
const refreshWeather = createEvent()

const $location = createStore<Location | null>(null).on(
  [fetchWeatherFx.doneData, setWeatherLocationFx.doneData],
  (_, snapshot) => snapshot.data?.location ?? null
)

const $weatherData = createStore<WeatherData | null>(null)
  .on([fetchWeatherFx.doneData, setWeatherLocationFx.doneData], (_, snapshot) => snapshot.data)
  .on(refreshWeatherFx.doneData, (_, result) => result.data)

const $weatherPending = createStore(false)
  .on([fetchWeatherFx, refreshWeatherFx, setWeatherLocationFx], () => true)
  .on([fetchWeatherFx.finally, refreshWeatherFx.finally, setWeatherLocationFx.finally], () => false)

const $weatherError = createStore<string | null>(null).on(
  [fetchWeatherFx.doneData, setWeatherLocationFx.doneData],
  (_, snapshot) => (snapshot.error ? snapshot.error : null)
)

// A failure deserves a toast, but only when the user asked for it: a background
// poll failing silently should not spam the screen.
sample({
  clock: refreshWeatherFx.failData,
  fn: (error) => {
    toast.error('Weather Update Failed', {
      description: error instanceof Error ? error.message : String(error),
      duration: 5000
    })
    return error
  },
  target: []
})

// The main process refreshes its cache on demand; the renderer has to ask for the
// new value because nothing pushes it yet.
const { tick } = interval({
  timeout: 15 * 60 * 1000,
  start: sample({
    clock: $location,
    filter: (location): location is Location => location !== null
  }),
  stop: sample({
    clock: $location,
    filter: (location) => location === null
  })
})

sample({ clock: tick, target: fetchWeatherFx })
sample({ clock: refreshWeather, target: refreshWeatherFx })

export {
  $location,
  $weatherData,
  $weatherError,
  $weatherPending,
  fetchWeatherFx,
  refreshWeather,
  setWeatherLocationFx
}
