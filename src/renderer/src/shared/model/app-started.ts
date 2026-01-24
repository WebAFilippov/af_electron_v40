import { createEffect, createEvent, sample } from 'effector'
import type { AppStarted } from '../../../../shared/types'
// import { toast } from 'sonner'

const appStartedFx = createEffect<void, AppStarted, Error>(
  async () => await window.api.appStarted()
)

// const appStartedSuccessNotificationFx = createEffect<AppStarted, void>((data) => {
//   new Promise(() => setTimeout(() => toast.success(data.settings.version), 10))
// })

// const appStartedErrorsNotificationFx = createEffect<Error, void>((error) => {
//   new Promise(() => setTimeout(() => toast.error(error.name, { description: error.message }), 100))
// })

const appStarted = createEvent<void>()

sample({
  clock: appStarted,
  target: appStartedFx
})

// sample({
//   clock: appStartedFx.doneData,
//   target: appStartedSuccessNotificationFx
// })

// sample({
//   clock: appStartedFx.failData,
//   target: appStartedErrorsNotificationFx
// })

export { appStarted, appStartedFx }
