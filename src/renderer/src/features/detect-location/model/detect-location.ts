import { createEffect, createEvent, createStore, sample } from 'effector'
import { not } from 'patronum'

import type { Location } from '@/shared_app/types'
import { $currentLocation, selectLocation } from '@/entities/location'
import type { IpWhoResponse } from './types'

/**
 * City detection by IP.
 *
 * Used so the weather page opens with actual weather instead of an empty search
 * prompt: most people run the app where they live, and picking a city before seeing
 * anything is a poor first impression.
 *
 * The result is never stored silently against the user's wishes — it only becomes
 * the current city, which is visible and changeable right on the page.
 */

const DETECT_ENDPOINT = 'https://ipwho.is/'
const TIMEOUT_MS = 8000

/** Why detection failed, in a form the UI can turn into a message. */
export type DetectError = 'offline' | 'no-city' | null

const detectLocationByIP = createEvent()
/** Automatic attempt on first open; stays silent when it fails. */
const requestAutoDetect = createEvent()

const $detectError = createStore<DetectError>(null)
/** True once a detection attempt has finished, successfully or not. */
const $detectAttempted = createStore(false)

const fetchDetectLocationFx = createEffect<void, Location, Error>(async () => {
  let response: Response

  try {
    response = await fetch(DETECT_ENDPOINT, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch {
    // A thrown fetch is a transport problem — no network, DNS failure, or the
    // service being blocked. All of them mean "cannot detect", not "bad data".
    throw new Error('offline')
  }

  if (!response.ok) {
    throw new Error('offline')
  }

  const raw = (await response.json()) as IpWhoResponse

  if (!raw.success) {
    throw new Error('offline')
  }

  // A VPN or data-centre connection often resolves to a place without a city.
  // Guessing coordinates anyway would silently show weather for the wrong region.
  if (!raw.city || raw.latitude == null || raw.longitude == null) {
    throw new Error('no-city')
  }

  return {
    id: raw.ip ?? `${raw.latitude},${raw.longitude}`,
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone?.id ?? 'auto',
    city: raw.city,
    region: raw.region ?? undefined,
    country: raw.country ?? ''
  }
})

const $isDetectPending = fetchDetectLocationFx.pending

$detectError
  .on(fetchDetectLocationFx.done, () => null)
  .on(fetchDetectLocationFx.failData, (_, error): DetectError =>
    error.message === 'no-city' ? 'no-city' : 'offline'
  )

$detectAttempted.on([fetchDetectLocationFx.done, fetchDetectLocationFx.fail], () => true)

// A successful detection becomes the current city.
sample({
  clock: fetchDetectLocationFx.doneData,
  target: selectLocation
})

// Manual attempts are gated only on a pending request.
sample({
  clock: detectLocationByIP,
  filter: not($isDetectPending),
  target: fetchDetectLocationFx
})

// The automatic attempt fires only when there is nothing to show yet and no attempt
// has been made before, so a failure does not retry on every render.
sample({
  clock: requestAutoDetect,
  source: { location: $currentLocation, attempted: $detectAttempted, pending: $isDetectPending },
  filter: ({ location, attempted, pending }) => location === null && !attempted && !pending,
  target: fetchDetectLocationFx
})

export {
  $detectAttempted,
  $detectError,
  $isDetectPending,
  detectLocationByIP,
  fetchDetectLocationFx,
  requestAutoDetect
}
