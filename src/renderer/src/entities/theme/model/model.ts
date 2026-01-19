import { createEffect, createEvent, createStore, sample } from 'effector'
import { Theme, ThemeMode } from '../../../../../shared/types'
import { appStarted } from '@/shared/model'

window.api.updateSystemTheme((value) => {
  applyThemeFx(value)
})

const getThemeFx = createEffect<void, Theme, Error>(async () => {
  return await window.api.getTheme()
})

const applyThemeFx = createEffect<Theme, Theme, Error>((value) => {
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

const setThemeFx = createEffect<ThemeMode, Theme, Error>(async (mode) => {
  try {
    return await window.api.setTheme(mode)
  } catch {
    throw new Error('Error setting window theme')
  }
})

const setTheme = createEvent<ThemeMode>()

const $theme = createStore<Theme>({
  mode: 'dark',
  darken: true
})

sample({
  clock: appStarted,
  target: [getThemeFx]
})

sample({
  clock: getThemeFx.doneData,
  target: [applyThemeFx]
})

sample({
  clock: applyThemeFx.doneData,
  target: [$theme]
})

sample({
  clock: setTheme,
  target: [setThemeFx]
})

sample({
  clock: setThemeFx.doneData,
  target: [applyThemeFx]
})

export { $theme, setTheme }
