import { createEvent, sample } from 'effector'

import type { Location } from '@/shared_app/types'
import { $location, setWeatherLocationFx } from '@/entities/weather'

/**
 * Selected city.
 *
 * The store itself lives in the weather entity: the main process persists it and
 * owns the fetch, so keeping a second copy here would let the two disagree.
 * This re-exports the same store under the name the location feature expects.
 */

const selectLocation = createEvent<Location>()

sample({
  clock: selectLocation,
  target: setWeatherLocationFx
})

export { $location as $currentLocation, selectLocation }
