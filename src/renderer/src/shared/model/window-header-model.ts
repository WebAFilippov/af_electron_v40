import { createEffect, createEvent, createStore, sample } from 'effector'
import { createGate } from 'effector-react'
import { WindowState } from '../../../../shared/types'

window.api.windowState((state) => changeWindowState(state))

const KeyDownToWindow = (event: KeyboardEvent): void => {
  if (event.altKey && event.key === 'Enter') {
    event.preventDefault()
    handleToggleFullScreen()
  }

  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleWindowMaximaze()
  }
}
const handleToggleFullScreen = createEffect(() => window.api.windowToggleFullScreen())
const handleWindowMaximaze = createEffect(() => window.api.windowMaximaze())
const handleWindowMinimaze = createEffect(() => window.api.windowMinimaze())
const handleWindowClose = createEffect(() => window.api.windowClose())

const GateWindowHeader = createGate()

const changeWindowState = createEvent<WindowState>()

const $window = createStore<WindowState>({
  minimize: false,
  maximize: false,
  fullscreen: false,
  show: false
})
const $windowMinimize = $window.map((state) => state.minimize)
const $windowMaximize = $window.map((state) => state.maximize)
const $windowFullscreen = $window.map((state) => state.fullscreen)
const $windowShow = $window.map((state) => state.show)

const addKeydownWindowFx = createEffect(() => {
  window.addEventListener('keydown', KeyDownToWindow)
})
const removeKeydownWindowFx = createEffect(() => {
  window.removeEventListener('keydown', KeyDownToWindow)
})

sample({
  clock: changeWindowState,
  target: $window
})

sample({
  clock: GateWindowHeader.open,
  target: [addKeydownWindowFx]
})
sample({
  clock: GateWindowHeader.close,
  target: [removeKeydownWindowFx]
})

export {
  GateWindowHeader,
  $window,
  $windowFullscreen,
  $windowMaximize,
  $windowMinimize,
  $windowShow,
  handleWindowClose,
  handleWindowMaximaze,
  handleWindowMinimaze
}
