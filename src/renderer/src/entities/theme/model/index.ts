import { createEffect, createStore, sample } from 'effector'
import { appStartedFx } from '@/shared/model/app-started'
import { ISettings } from '../../../../../shared/types'
import { and, not } from 'patronum'

window.api.settingsUpdateSystemTheme((value) => {
  applyThemeFx(value)
})

const applyThemeFx = createEffect<ISettings['theme'], ISettings['theme']>((value) => {
  const html = document.documentElement
  if (!html) {
    throw new Error('html element not found')
  }
  html.classList.remove('light', 'dark')
  switch (value.mode) {
    case 'system':
      if (value.darken) {
        html.classList.add('dark')
      } else {
        html.classList.add('light')
      }
      break
    case 'dark':
      html.classList.add('dark')
      break
    case 'light':
      html.classList.add('light')
      break
  }

  return value
})

const setThemeFx = createEffect<ISettings['theme']['mode'], ISettings['theme']>((mode) =>
  window.api.settingsSetTheme(mode)
)

const $theme = createStore<ISettings['theme']>({
  mode: 'light',
  darken: false
})

sample({
  clock: appStartedFx.doneData,
  fn: (data) => data.settings.theme,
  target: applyThemeFx
})

sample({
  clock: setThemeFx.doneData,
  filter: and(not(setThemeFx.pending), not(applyThemeFx.pending)),
  target: applyThemeFx
})

sample({
  clock: applyThemeFx.doneData,
  target: $theme
})

export { $theme, setThemeFx }
