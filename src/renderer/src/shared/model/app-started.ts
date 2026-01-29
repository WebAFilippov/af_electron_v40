import { createEffect, createEvent, sample } from 'effector'
import type { AppStarted } from '../../../../shared/types'

const appStartedFx = createEffect<void, AppStarted, Error>(
  async () => await window.api.appStarted()
)

const appStarted = createEvent<void>()

sample({
  clock: appStarted,
  target: appStartedFx
})

export { appStarted, appStartedFx }
