import './styles/globals.css'

import ReactDOM from 'react-dom/client'
import { createEvent, sample } from 'effector'
import { RouterProvider } from 'react-router/dom'

import { router } from './providers/routing'

import { initWindowControlsFx } from '@/widgets/window-control-panel'
import { initI18Next } from '@/entities/i18next'
import { initThemeFx } from '@/entities/theme'
import { initializeWeather } from '@/entities/weather'
import { $currentLocation } from '@/entities/location'
import { requestAutoDetect } from '@/features/detect-location'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)

const appStarted = createEvent<void>()

sample({
  clock: appStarted,
  target: [initThemeFx, initWindowControlsFx, initI18Next]
})

/**
 * Weather is loaded on application start, not on first visit to the weather page.
 *
 * The home page shows a weather preview, so waiting for the page to open would leave
 * that preview blank — which reads as a broken feature rather than a not-yet-loaded
 * one. Both branches are needed: without a saved city there is nothing to fetch, so
 * the detector runs first and its result triggers the fetch.
 */
sample({
  clock: appStarted,
  source: $currentLocation,
  filter: (location) => location !== null,
  fn: () => undefined,
  target: initializeWeather
})

sample({
  clock: appStarted,
  source: $currentLocation,
  filter: (location) => location === null,
  fn: () => undefined,
  target: requestAutoDetect
})

// Once detection finds a city, load its weather.
sample({
  clock: $currentLocation,
  filter: (location) => location !== null,
  fn: () => undefined,
  target: initializeWeather
})

appStarted()

root.render(<RouterProvider router={router} />)
