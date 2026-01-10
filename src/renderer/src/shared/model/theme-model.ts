import { AppStarter } from './app-starter'
import { createEffect, createEvent, createStore, sample } from 'effector'

type Theme = 'light' | 'dark'

const applyThemeFx = createEffect<Theme, void, Error>((theme) => {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found')
  }

  root.classList.remove('light', 'dark')
  root.classList.add(theme)
})
const getThemeFx = createEffect<void, Theme, Error>(async () => {
  try {
    return await window.api.getWindowTheme()
  } catch (error) {
    throw new Error('Error getting window theme')
  }
})
const updateThemeFx = createEffect<Theme, void, Error>((theme) => {
  window.api.updateWindowTheme(theme)
})

const themeToggle = createEvent()
const setTheme = createEvent<Theme>()

const $theme = createStore<Theme>('light')

sample({
  clock: setTheme,
  source: $theme,
  filter: (theme, newTheme) => theme !== newTheme,
  target: [$theme, applyThemeFx, updateThemeFx]
})

sample({
  clock: themeToggle,
  source: $theme,
  fn: (theme) => {
    if (theme === 'light') {
      return 'dark'
    }
    return 'light'
  },
  target: [$theme, applyThemeFx, updateThemeFx]
})

sample({
  clock: getThemeFx.doneData,
  target: [$theme, applyThemeFx]
})

sample({
  clock: AppStarter,
  target: [getThemeFx]
})

export { $theme, setTheme, themeToggle }
