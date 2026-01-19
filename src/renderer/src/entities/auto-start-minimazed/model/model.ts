import { appStarted } from '@/shared/model'
import { createEffect, createEvent, createStore, sample } from 'effector'

const getAutoStartMinimazedFx = createEffect<void, boolean, Error>(() => {
  return true
})

const setAutoStartMinimazedFx = createEffect<boolean, void, Error>(() => {})

const toggleAutoStartMinimazed = createEvent<void>()

const $autoStartMinimazed = createStore(true)

sample({
  clock: appStarted,
  target: [getAutoStartMinimazedFx]
})

sample({
  clock: getAutoStartMinimazedFx.doneData,
  target: [$autoStartMinimazed]
})

sample({
  clock: toggleAutoStartMinimazed,
  source: $autoStartMinimazed,
  fn: (store) => !store,
  target: [$autoStartMinimazed, setAutoStartMinimazedFx]
})

export { $autoStartMinimazed, toggleAutoStartMinimazed }
