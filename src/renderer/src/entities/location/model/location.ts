import { createQuery } from '@farfetched/core'
import { createStore, createEvent, sample } from 'effector'
import { persist } from 'effector-storage/local'
import { toast } from 'sonner'
import type { GeocodingResponse, Location } from '@/shared_app/api/open-meteo/types'
import { LanguageApp } from '@/shared_app/types'

const LANGUAGE_PRIORITY: { pattern: RegExp; lang: LanguageApp }[] = [{ pattern: /[а-яА-ЯёЁыЫъЪьЬ]/, lang: 'ru' }]

const detectLanguage = (query: string): LanguageApp => {
  for (const { pattern, lang } of LANGUAGE_PRIORITY) {
    if (pattern.test(query)) {
      return lang
    }
  }
  return 'en'
}

const mapToAPILanguage = (lang: LanguageApp): string => {
  const supportedLanguages = ['en', 'ru']
  if (supportedLanguages.includes(lang)) {
    return lang
  }
  return 'ru'
}

export const selectLocation = createEvent<Location>()
export const clearLocation = createEvent()
export const locationRestored = createEvent<Location>()

export const $currentLocation = createStore<Location | null>(null)

// Persist location to localStorage
persist({
  store: $currentLocation,
  key: 'weather-location',
  pickup: locationRestored
})

// Geocoding Query - Search for cities with auto language detection
export const searchLocationsQuery = createQuery({
  handler: async (query: string) => {
    if (!query || query.length < 2) {
      return { results: [], generationtime_ms: 0 }
    }

    const detectedLang = detectLanguage(query)
    const apiLang = mapToAPILanguage(detectedLang)

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
    url.searchParams.append('name', query)
    url.searchParams.append('count', '5')
    url.searchParams.append('language', apiLang)
    url.searchParams.append('format', 'json')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    return response.json() as Promise<GeocodingResponse>
  }
})

// Show toast on geocoding error
sample({
  clock: searchLocationsQuery.finished.failure,
  fn: ({ error }) => {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search locations'
    toast.error('Search Failed', {
      description: errorMessage,
      duration: 5000
    })
    return error
  },
  target: []
})

// Update location on select
sample({
  clock: selectLocation,
  target: $currentLocation
})

// Clear location
sample({
  clock: clearLocation,
  fn: () => null,
  target: $currentLocation
})

// Event to clear search results
export const clearSearchResults = createEvent()

// Transform geocoding results to Location array
export const $searchResults = createStore<Location[]>([])

// Update results from query data
sample({
  clock: searchLocationsQuery.$data,
  fn: (data) => {
    if (!data?.results) return []
    return data.results.map(
      (result): Location => ({
        id: result.id,
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        admin1: result.admin1,
        timezone: result.timezone,
        elevation: result.elevation
      })
    )
  },
  target: $searchResults
})

// Clear results on event
sample({
  clock: clearSearchResults,
  fn: () => [],
  target: $searchResults
})

export const $searchPending = searchLocationsQuery.$pending
export const $searchError = searchLocationsQuery.$error
