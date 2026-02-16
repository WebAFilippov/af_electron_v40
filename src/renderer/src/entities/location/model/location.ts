import { createStore, createEvent, sample } from 'effector'

import { Location } from '@/shared_app/types'

const selectLocation = createEvent<Location>()

const $currentLocation = createStore<Location | null>(null)

sample({
  clock: selectLocation,
  target: $currentLocation
})

export { $currentLocation, selectLocation }
