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

/**
 * Why the last fetch failed, in a form the UI can turn into a message.
 *
 * Distinguishing "no network" from "the service did not answer" matters: the first
 * is something the user can fix, the second is not.
 */
export type WeatherFailure = 'offline' | 'timeout' | 'server' | null

const classifyFailure = (message: string): WeatherFailure => {
  const lower = message.toLowerCase()

  if (lower.includes('timeout') || lower.includes('aborted')) {
    return 'timeout'
  }
  if (
    lower.includes('fetch failed') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('network') ||
    lower.includes('offline')
  ) {
    return 'offline'
  }
  return 'server'
}

const $weatherFailure = createStore<WeatherFailure>(null)
  .on([fetchWeatherFx.doneData, setWeatherLocationFx.doneData], (_, snapshot) =>
    snapshot.error ? classifyFailure(snapshot.error) : null
  )
  .on(refreshWeatherFx.doneData, () => null)

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

/**
 * Auto-refresh.
 *
 * Two things needed fixing here:
 *
 *  1. `interval.start` received a bare `$location`-triggered sample, so the timer
 *     only began when the store *changed*. A city restored from settings is already
 *     present before this module mounts, so no change ever fired and the refresh
 *     never ran at all. The timer is now started explicitly by the page gate.
 *  2. The tick called the cached read. The cache lives for the same 15 minutes as
 *     the timer, so it usually returned the previous payload unchanged. It now
 *     forces a fetch, which is the whole point of a periodic refresh.
 */
const WEATHER_REFRESH_MS = 15 * 60 * 1000

/** Starts the periodic refresh once a city is known. */
const startWeatherAutoRefresh = createEvent()

const { tick } = interval({
  timeout: WEATHER_REFRESH_MS,
  start: startWeatherAutoRefresh,
  stop: sample({
    clock: $location,
    filter: (location) => location === null
  })
})

sample({ clock: tick, target: refreshWeatherFx })
sample({ clock: refreshWeather, target: refreshWeatherFx })

/**
 * Requests the weather for the current city.
 *
 * Kept as a plain event rather than wired to a page, because the home page shows a
 * weather preview: binding the request to the weather page would leave that preview
 * empty until the user happened to open the page. The app shell fires this on start.
 *
 * Detection of the city is intentionally *not* part of this event — that belongs to
 * the feature layer, which knows about geolocation. This event only reads.
 */
const initializeWeather = createEvent()

sample({
  clock: initializeWeather,
  source: { location: $location, pending: $weatherPending },
  filter: ({ location, pending }) => location !== null && !pending,
  target: fetchWeatherFx
})

// A city restored or chosen later must start the timer: the interval stops while
// `$location` is null and would otherwise never run.
sample({
  clock: setWeatherLocationFx.doneData,
  filter: (snapshot) => snapshot.data !== null,
  fn: () => undefined,
  target: startWeatherAutoRefresh
})

export {
  $location,
  $weatherData,
  $weatherError,
  $weatherFailure,
  $weatherPending,
  fetchWeatherFx,
  initializeWeather,
  refreshWeather,
  setWeatherLocationFx,
  startWeatherAutoRefresh
}
