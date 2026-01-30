import { createEffect, createEvent, createStore, sample } from 'effector'
import { and, not } from 'patronum'

import { SettingsProps } from '@/shared_app/types'

const fetchStartMinimizedFx = createEffect<void, SettingsProps['startMinimized']>(() =>
  window.settings_app.getSettingsByProperty('startMinimized')
)

const updateStartMinimizedFx = createEffect<boolean, boolean>((value) => window.settings_app.setStartMinimized(value))

const toggleStartMinimized = createEvent()

const $startMinimized = createStore(false)
  .on(fetchStartMinimizedFx.doneData, (_, data) => data)
  .on(updateStartMinimizedFx.doneData, (_, data) => data)

sample({
  clock: toggleStartMinimized,
  filter: and(not(updateStartMinimizedFx.pending), not(fetchStartMinimizedFx.pending)),
  source: $startMinimized,
  fn: (current) => !current,
  target: updateStartMinimizedFx
})

export { $startMinimized, toggleStartMinimized, fetchStartMinimizedFx }
