import { appStartedFx } from '@/shared/model'
import { createEffect, createEvent, createStore, sample } from 'effector'
import { not } from 'patronum'

const setAutoLaunchFx = createEffect<boolean, boolean, Error>(async (value) => {
  return await window.api.settingsSetAutoLaunch(value)
})

const toggleAutoLaunch = createEvent<void>()

const $autoLaunch = createStore(true)

sample({
  clock: appStartedFx.doneData,
  fn: (data) => data.settings.autoLaunch,
  target: [$autoLaunch]
})

sample({
  clock: toggleAutoLaunch,
  filter: not(setAutoLaunchFx.pending),
  source: $autoLaunch,
  fn: (store) => !store,
  target: setAutoLaunchFx
})

sample({
  clock: setAutoLaunchFx.doneData,
  target: $autoLaunch
})

export { $autoLaunch, toggleAutoLaunch }
