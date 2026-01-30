import { createEffect, createEvent, createStore, sample } from 'effector'
import { and, not } from 'patronum'

import { SettingsProps } from '@/shared_app/types'

const fetchCheckForUpdatesOnStartupFx = createEffect<void, SettingsProps['checkForUpdatesOnStartup']>(() =>
  window.settings_app.getSettingsByProperty('checkForUpdatesOnStartup')
)

const updateCheckForUpdatesOnStartupFx = createEffect<
  SettingsProps['checkForUpdatesOnStartup'],
  SettingsProps['checkForUpdatesOnStartup']
>((value) => window.settings_app.setCheckForUpdatesOnStartup(value))

const toggleCheckForUpdatesOnStartup = createEvent()

const $checkForUpdatesOnStartup = createStore<boolean>(true)
  .on(fetchCheckForUpdatesOnStartupFx.doneData, (_, data) => data)
  .on(updateCheckForUpdatesOnStartupFx.doneData, (_, data) => data)

sample({
  clock: toggleCheckForUpdatesOnStartup,
  source: $checkForUpdatesOnStartup,
  filter: and(not(updateCheckForUpdatesOnStartupFx.pending), not(fetchCheckForUpdatesOnStartupFx.pending)),
  fn: (current) => !current,
  target: updateCheckForUpdatesOnStartupFx
})

export { $checkForUpdatesOnStartup, toggleCheckForUpdatesOnStartup, fetchCheckForUpdatesOnStartupFx }
