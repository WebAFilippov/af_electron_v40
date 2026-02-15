import { createQuery } from '@farfetched/core'
import { createEvent, sample } from 'effector'
import { toast } from 'sonner'
import type { Location } from '@/shared_app/api/open-meteo/types'
import { selectLocation } from '@/entities/location'

const detectLocationByIP = createEvent()

const ipGeolocationQuery = createQuery({
  handler: async () => {
    const response = await fetch(
      'http://ip-api.com/json/?fields=status,message,city,lat,lon,country,regionName,timezone,query'
    )

    if (!response.ok) {
      throw new Error(`IP Geolocation API error: ${response.status}`)
    }

    const data = await response.json()

    console.log(data)

    if (data.status !== 'success') {
      throw new Error(data.message || 'Could not determine location from IP')
    }

    if (!data.lat || !data.lon) {
      throw new Error('Could not determine location coordinates from IP')
    }

    const location: Location = {
      id: data.query,
      name: data.city || 'Unknown',
      latitude: data.lat,
      longitude: data.lon,
      country: data.country || 'Unknown',
      admin1: data.regionName,
      timezone: data.timezone || 'Unknown'
    }

    return location
  }
})

sample({
  clock: detectLocationByIP,
  target: ipGeolocationQuery.start
})

sample({
  clock: ipGeolocationQuery.finished.success,
  fn: ({ result }) => result,
  target: selectLocation
})

sample({
  clock: ipGeolocationQuery.finished.failure,
  fn: ({ error }) => {
    const errorMessage = error instanceof Error ? error.message : 'Failed to detect location'
    toast.error('Location Detection Failed', {
      description: errorMessage,
      duration: 5000
    })
    return error
  },
  target: []
})

const $ipDetectionPending = ipGeolocationQuery.$pending
const $ipDetectionError = ipGeolocationQuery.$error

export { $ipDetectionPending, $ipDetectionError, detectLocationByIP, ipGeolocationQuery }
