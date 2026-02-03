import { createQuery } from '@farfetched/core'
import { createEvent, sample } from 'effector'
import { toast } from 'sonner'
import type { Location } from '@/shared_app/api/open-meteo/types'
import { selectLocation } from '@/entities/location'

// Event to trigger IP detection
export const detectLocationByIP = createEvent()

// IP Geolocation Query using ip-api.com (CORS-friendly, free for non-commercial use)
export const ipGeolocationQuery = createQuery({
  handler: async () => {
    // Using ip-api.com (free, CORS-enabled for non-commercial use)
    // Rate limit: 45 requests per minute from same IP
    const response = await fetch(
      'http://ip-api.com/json/?fields=status,message,city,lat,lon,country,regionName,timezone'
    )

    if (!response.ok) {
      throw new Error(`IP Geolocation API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'success') {
      throw new Error(data.message || 'Could not determine location from IP')
    }

    if (!data.lat || !data.lon) {
      throw new Error('Could not determine location coordinates from IP')
    }

    // Convert to Location type
    const location: Location = {
      id: data.city ? data.city.toLowerCase().replace(/\s+/g, '-') : 'detected',
      name: data.city || 'Unknown',
      latitude: data.lat,
      longitude: data.lon,
      country: data.country || 'Unknown',
      admin1: data.regionName,
      timezone: data.timezone || 'UTC',
      elevation: 0 // Will be updated by weather API
    }

    return location
  }
})

// Auto-detect on app start (if no saved location)
sample({
  clock: detectLocationByIP,
  target: ipGeolocationQuery.start
})

// Save detected location
sample({
  clock: ipGeolocationQuery.finished.success,
  fn: ({ result }) => result,
  target: selectLocation
})

// Show toast on error
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

export const $ipDetectionPending = ipGeolocationQuery.$pending
export const $ipDetectionError = ipGeolocationQuery.$error
