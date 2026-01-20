import { createEffect, createStore, sample } from 'effector'
import { appStartedFx } from '@/shared/model/app-started'
import { ISettings } from '../../../../../shared/types'

window.api.settingsUpdateSystemTheme((value) => {
  applyThemeFx(value)
})

const applyThemeFx = createEffect<ISettings['theme'], ISettings['theme']>((value) => {
  console.log('value ', value)
  const body = document.body
  if (!body) {
    throw new Error('Body element not found')
  }
  body.classList.remove('light', 'dark')
  switch (value.mode) {
    case 'system':
      if (value.darken) {
        body.classList.add('dark')
      } else {
        body.classList.add('light')
      }
      break
    case 'dark':
      body.classList.add('dark')
      break
    case 'light':
      body.classList.add('light')
      break
  }

  return value
})

const setThemeFx = createEffect<ISettings['theme']['mode'], ISettings['theme']>(
  async (mode) => await window.api.settingsSetTheme(mode)
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
  clock: applyThemeFx.doneData,
  target: $theme
})

sample({
  clock: setThemeFx.doneData,
  target: applyThemeFx
})

export { $theme, setThemeFx }

$theme.watch(console.log)
