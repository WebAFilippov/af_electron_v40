import { createGate } from 'effector-react'
import { sample } from 'effector'

import { $currentLocation } from '@/entities/location'
import { initializeWeather } from '@/entities/weather'
import { requestAutoDetect } from '@/features/detect-location'

/**
 * Weather page gate.
 *
 * The initial load happens at application start (see `app/main.tsx`), because the
 * home page shows a weather preview. This gate only covers the case of opening the
 * weather page while data is still missing — after a failed request, or when the app
 * started without a network.
 *
 * Mounting is idempotent: the model skips a fetch that is already in flight, and the
 * detector refuses to run twice.
 */
export const GateWeatherPage = createGate()

// Read whatever the main process has, when there is a city to read it for.
sample({
  clock: GateWeatherPage.open,
  source: $currentLocation,
  filter: (location) => location !== null,
  fn: () => undefined,
  target: initializeWeather
})

// Still no city (a previous detection failed): try once more on an explicit visit,
// so the user is not stuck without a button to press.
sample({
  clock: GateWeatherPage.open,
  source: $currentLocation,
  filter: (location) => location === null,
  fn: () => undefined,
  target: requestAutoDetect
})
