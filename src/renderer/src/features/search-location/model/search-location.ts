import { createEffect, createEvent, createStore, sample } from 'effector'
import { createQuery } from '@farfetched/core'

import { Location } from '@/shared_app/types'
import { detectLanguage } from '../utils/detect-language'
import { mapToAPILanguage } from '../utils/map-to-API-language'
import { debounce } from 'patronum'
import { toast } from 'sonner'

import { GeocodingResponse } from './types'
import { selectLocation } from '@/entities/location'

const changeSearchQuery = createEvent<string>()
const resetSearchResults = createEvent<void>()
const resetSearchQuery = createEvent<void>()

const fetchSearchLocationsFx = createEffect<string, GeocodingResponse>(async (query) => {
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
})

const errorToastSearchLocationsFx = createEffect<Error, void>((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Failed to search locations'
  toast.error('Search Failed', {
    description: errorMessage,
    duration: 5000
  })
})

export const searchLocationsQuery = createQuery({
  name: 'GetLocationsByQuery',
  effect: fetchSearchLocationsFx,
  mapData: (data) => {
    if (!data.result.results) return []

    return data.result.results.map((res) => {
      return {
        id: res.id,
        latitude: res.latitude,
        longitude: res.longitude,
        timezone: res.timezone,
        city: res.name,
        region: res.admin1,
        country: res.country
      }
    })
  }
})

const $searchQuery = createStore<string>('').reset(resetSearchQuery)
const $searchResults = createStore<Location[]>([]).reset(resetSearchResults)
const $searchPending = searchLocationsQuery.$pending

sample({
  clock: changeSearchQuery,
  target: $searchQuery
})

sample({
  clock: changeSearchQuery,
  filter: (query) => query.length < 2,
  target: resetSearchResults
})

sample({
  clock: selectLocation,
  target: [resetSearchResults, resetSearchQuery]
})

const debouncedSearch = debounce({
  source: changeSearchQuery,
  timeout: 350
})

sample({
  clock: debouncedSearch,
  filter: (query) => query.length > 1,
  target: searchLocationsQuery.start
})

sample({
  clock: searchLocationsQuery.finished.success,
  fn: ({ result }) => result,
  target: $searchResults
})

sample({
  clock: searchLocationsQuery.$error,
  filter: (error) => error !== null,
  target: errorToastSearchLocationsFx
})

export { $searchQuery, $searchResults, $searchPending, changeSearchQuery }
