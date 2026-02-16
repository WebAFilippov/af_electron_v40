import { createQuery, InvalidDataError, isInvalidDataError } from '@farfetched/core'
import { createEffect, createEvent, sample } from 'effector'
import { toast } from 'sonner'
import { IPApiResponse } from './types'
import { selectLocation } from '@/entities/location'
import { not } from 'patronum'
import { zodContract } from '@farfetched/zod'
import { IPApiResponseSchema } from './contract'

const ipApiContract = zodContract(IPApiResponseSchema)

const detectLocationByIP = createEvent()

const fetchDetectLocationFx = createEffect<void, IPApiResponse>(async () => {
  const response = await fetch(
    'http://ip-api.com/json/?fields=status,message,city,regionName,country,lat,lon,timezone,query'
  )

  if (!response.ok) {
    throw new Error(`IP-API error: ${response.status}`)
  }

  const data = (await response.json()) as IPApiResponse

  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to get location')
  }

  return data
})

const errorToastFx = createEffect<Error | InvalidDataError, void>((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Failed to search locations'
  toast.error('Search Failed', {
    description: errorMessage,
    duration: 5000
  })

  window.log_app.log('error', errorMessage)
})

const detectLocationQuery = createQuery({
  name: 'ipGeolocation',
  effect: fetchDetectLocationFx,
  contract: ipApiContract,
  mapData: ({ result }) => {
    return {
      id: result.query,
      latitude: result.lat,
      longitude: result.lon,
      timezone: result.timezone,
      city: result.city,
      region: result.regionName,
      country: result.country
    }
  }
})

const $isPending = detectLocationQuery.$pending

sample({
  clock: detectLocationQuery.finished.failure,
  filter: (error) => isInvalidDataError(error),
  fn: ({ error }) => error,
  target: errorToastFx
})

sample({
  clock: detectLocationByIP,
  filter: not($isPending),
  target: detectLocationQuery.start
})

sample({
  clock: detectLocationQuery.finished.success,
  fn: ({ result }) => result,
  target: selectLocation
})

export { $isPending, detectLocationByIP }
