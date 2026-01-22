import { appStartedFx } from '@/shared/model'
import { createEffect, createEvent, createStore, sample } from 'effector'
import { not } from 'patronum'

const setAutoStartMinimazedFx = createEffect<boolean, boolean, Error>(async (value) => {
  return window.api.settingSetStartMininaze(value)
})

const toggleAutoStartMinimazed = createEvent<void>()

const $autoStartMinimazed = createStore(false)

sample({
  clock: appStartedFx.doneData,
  fn: (data) => data.settings.startMinimized,
  target: [$autoStartMinimazed]
})

sample({
  clock: toggleAutoStartMinimazed,
  filter: not(setAutoStartMinimazedFx.pending),
  source: $autoStartMinimazed,
  fn: (store) => !store,
  target: setAutoStartMinimazedFx
})

sample({
  clock: setAutoStartMinimazedFx.doneData,
  target: $autoStartMinimazed
})

export { $autoStartMinimazed, toggleAutoStartMinimazed }
