import { createEffect, createEvent, createStore, sample } from 'effector'
import { and, not } from 'patronum'

import { SettingsProps } from '@/shared_app/types'

const fetchAutoLaunchFx = createEffect<void, SettingsProps['autoLaunch']>(() =>
  window.settings_app.getSettingsByProperty('autoLaunch')
)

const updateAutoLaunchFx = createEffect<boolean, boolean>((value) => window.settings_app.setAutoLaunch(value))

const toggleAutoLaunch = createEvent()

const $autoLaunch = createStore(true)
  .on(fetchAutoLaunchFx.doneData, (_, data) => data)
  .on(updateAutoLaunchFx.doneData, (_, data) => data)

sample({
  clock: toggleAutoLaunch,
  source: $autoLaunch,
  filter: and(not(updateAutoLaunchFx.pending), not(fetchAutoLaunchFx.pending)),
  fn: (current) => !current,
  target: updateAutoLaunchFx
})

export { $autoLaunch, toggleAutoLaunch, fetchAutoLaunchFx }
