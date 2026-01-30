import { createEffect, createEvent, createStore, sample } from 'effector'
import { and, not } from 'patronum'

import { ThemeProps } from '@/shared_app/types'

const applyThemeFx = createEffect<ThemeProps, ThemeProps>((theme) => {
  const html = document.documentElement
  if (!html) {
    throw new Error('html element not found')
  }

  html.classList.remove('light', 'dark')

  switch (theme.mode) {
    case 'system':
      html.classList.add(theme.darken ? 'dark' : 'light')
      break
    case 'dark':
      html.classList.add('dark')
      break
    case 'light':
      html.classList.add('light')
      break
  }

  return theme
})

const initThemeFx = createEffect(() => {
  window.theme_app.onUpdateSystemTheme((newTheme: ThemeProps) => applyThemeFx(newTheme))
  fetchThemeFx()
})

const fetchThemeFx = createEffect<void, ThemeProps>(() => window.theme_app.getTheme())

const updateThemeModeFx = createEffect<ThemeProps['mode'], ThemeProps>((mode) => window.theme_app.setTheme(mode))

const updateThemeMode = createEvent<ThemeProps['mode']>()

const $theme = createStore<ThemeProps>({
  mode: 'light',
  darken: false
}).on(applyThemeFx.doneData, (_, theme) => theme)

sample({
  clock: fetchThemeFx.doneData,
  target: applyThemeFx
})

sample({
  clock: updateThemeModeFx.doneData,
  target: applyThemeFx
})

sample({
  clock: updateThemeMode,
  filter: and(not(updateThemeModeFx.pending), not(fetchThemeFx.pending), not(applyThemeFx.pending)),
  target: updateThemeModeFx
})

export { $theme, updateThemeMode, initThemeFx }
