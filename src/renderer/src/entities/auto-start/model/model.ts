import { appStarted } from '@/shared/model'
import { createEffect, createEvent, createStore, sample } from 'effector'

const getAutoStartFx = createEffect<void, boolean, Error>(() => {
  return true
})

const setAutoStartFx = createEffect<boolean, void, Error>(() => {})

const toggleAutoStart = createEvent<void>()

const $autoStart = createStore(true)

sample({
  clock: appStarted,
  target: [getAutoStartFx]
})

sample({
  clock: getAutoStartFx.doneData,
  target: [$autoStart]
})

sample({
  clock: toggleAutoStart,
  source: $autoStart,
  fn: (store) => !store,
  target: [$autoStart, setAutoStartFx]
})

export { $autoStart, toggleAutoStart }

$autoStart.watch(console.log)
