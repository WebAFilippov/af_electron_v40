import { createEffect, createEvent, createStore, sample } from 'effector'
import { createGate } from 'effector-react'
import type { IWindow } from '../../../../../shared/types'

window.api.windowState((state) => changeWindowState(state))

const KeyDownToWindow = (event: KeyboardEvent): void => {
  if (event.altKey && event.key === 'Enter') {
    event.preventDefault()
    handleToggleFullScreenFx()
  }

  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleWindowMaximazeFx()
  }
}

const addKeydownWindowFx = createEffect(() => {
  window.addEventListener('keydown', KeyDownToWindow)
})
const removeKeydownWindowFx = createEffect(() => {
  window.removeEventListener('keydown', KeyDownToWindow)
})

const GateWindowControlPanel = createGate()

const handleToggleFullScreenFx = createEffect(() => window.api.windowToggleFullScreen())
const handleWindowMaximazeFx = createEffect(() => window.api.windowMaximaze())
const handleWindowMinimazeFx = createEffect(() => window.api.windowMinimaze())
const handleWindowCloseFx = createEffect(() => window.api.windowClose())

const changeWindowState = createEvent<IWindow>()

const $window = createStore<IWindow>({
  minimize: false,
  maximize: false,
  fullscreen: false,
  show: false
})
const $windowMinimize = $window.map((state) => state.minimize)
const $windowMaximize = $window.map((state) => state.maximize)
const $windowFullscreen = $window.map((state) => state.fullscreen)
const $windowShow = $window.map((state) => state.show)

sample({
  clock: changeWindowState,
  target: $window
})

sample({
  clock: GateWindowControlPanel.open,
  target: [addKeydownWindowFx]
})
sample({
  clock: GateWindowControlPanel.close,
  target: [removeKeydownWindowFx]
})

export {
  GateWindowControlPanel,
  $window,
  $windowFullscreen,
  $windowMaximize,
  $windowMinimize,
  $windowShow,
  handleWindowCloseFx,
  handleWindowMaximazeFx,
  handleWindowMinimazeFx
}
