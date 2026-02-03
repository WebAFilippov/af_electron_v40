import { createEvent, createStore, sample } from 'effector'
import { debounce } from 'patronum'
import {
  searchLocationsQuery,
  $searchResults,
  $searchPending,
  selectLocation,
  clearLocation
} from '@/entities/location'

// Event to change search query
export const changeSearchQuery = createEvent<string>()

// Store for search query
export const $searchQuery = createStore('')

// Debounced search (300ms)
const debouncedSearch = debounce({
  source: changeSearchQuery,
  timeout: 300
})

// Update query store
sample({
  clock: changeSearchQuery,
  target: $searchQuery
})

// Start search when debounced
sample({
  clock: debouncedSearch,
  filter: (query) => query.length >= 2,
  target: searchLocationsQuery.start
})

// Clear results when query is too short
sample({
  clock: changeSearchQuery,
  filter: (query) => query.length < 2,
  target: clearLocation
})

export { $searchResults, $searchPending, selectLocation }
