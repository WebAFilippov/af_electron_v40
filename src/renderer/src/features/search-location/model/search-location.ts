import { createEvent, createStore, sample } from 'effector'
import { debounce } from 'patronum'
import {
  searchLocationsQuery,
  $searchResults,
  $searchPending,
  selectLocation,
  clearSearchResults
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

// Clear results when query is empty or too short
sample({
  clock: changeSearchQuery,
  filter: (query) => query.length < 2,
  target: clearSearchResults
})

// Clear results when location selected
sample({
  clock: selectLocation,
  target: clearSearchResults
})

// Start search when debounced
sample({
  clock: debouncedSearch,
  filter: (query) => query.length >= 2,
  target: searchLocationsQuery.start
})

export { $searchResults, $searchPending, selectLocation }
