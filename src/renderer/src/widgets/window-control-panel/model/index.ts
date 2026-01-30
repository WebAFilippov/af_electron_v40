import { createEffect, createEvent, createStore, sample } from 'effector'

import { WindowAppProps } from '@/shared_app/types'

const onWindowKeyDown = (event: KeyboardEvent): void => {
  if (event.altKey && event.key === 'Enter') {
    event.preventDefault()
    toggleFullscreenFx()
  }

  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    maximizeWindowFx()
  }
}

const initWindowControlsFx = createEffect(() => window.window_app.onState((state) => updateWindow(state)))
const setupWindowShortcutsFx = createEffect(() => {
  window.addEventListener('keydown', onWindowKeyDown)
})
const toggleFullscreenFx = createEffect(() => window.window_app.toggleFullScreen())
const maximizeWindowFx = createEffect(() => window.window_app.setMaximize())
const minimizeWindowFx = createEffect(() => window.window_app.setMinimize())
const closeWindowFx = createEffect(() => window.window_app.setClose())

const updateWindow = createEvent<WindowAppProps>()

const $window = createStore<WindowAppProps>({
  minimize: false,
  maximize: false,
  fullscreen: false,
  show: false
}).on(updateWindow, (_, state) => state)

const $isMinimized = $window.map((state) => state.minimize)
const $isMaximized = $window.map((state) => state.maximize)
const $isFullscreen = $window.map((state) => state.fullscreen)
const $isVisible = $window.map((state) => state.show)

sample({
  clock: setupWindowShortcutsFx,
  target: setupWindowShortcutsFx
})

export {
  initWindowControlsFx,
  $window,
  $isMinimized,
  $isMaximized,
  $isFullscreen,
  $isVisible,
  toggleFullscreenFx,
  maximizeWindowFx,
  minimizeWindowFx,
  closeWindowFx
}
