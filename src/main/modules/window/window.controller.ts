import { BrowserWindow, ipcMain } from 'electron'
import { channels, IWindow } from '../../../shared/types'

const sendWindowState = (
  window: BrowserWindow,
  key?: 'enter-full-screen' | 'leave-full-screen'
): void => {
  if (window.isDestroyed()) return

  const state: IWindow = {
    minimize: window.isMinimized(),
    maximize: window.isMaximized(),
    fullscreen:
      key === 'enter-full-screen'
        ? true
        : key === 'leave-full-screen'
          ? false
          : window.isFullScreen(),
    show: window.isVisible()
  }

  window.webContents.send(channels.window_updated, state)
}

export const ipcWindow = (window: BrowserWindow): void => {
  ipcMain.on(channels.window_fullscreen, () => {
    window.setFullScreen(!window.isFullScreen())
  })

  ipcMain.on(channels.window_minimaze, () => {
    window.minimize()
  })

  ipcMain.on(channels.window_maximaze, () => {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  ipcMain.on(channels.window_close, () => {
    window.hide()
  })

  window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      event.preventDefault()
      window.setFullScreen(!window.isFullScreen())
    }
  })

  window.on('maximize', () => sendWindowState(window))
  window.on('minimize', () => sendWindowState(window))
  window.on('restore', () => sendWindowState(window))
  window.on('unmaximize', () => sendWindowState(window))
  window.on('enter-full-screen', () => sendWindowState(window, 'enter-full-screen'))
  window.on('leave-full-screen', () => sendWindowState(window, 'leave-full-screen'))
  window.on('show', () => sendWindowState(window))
  window.on('hide', () => sendWindowState(window))
  window.on('close', () => sendWindowState(window))

  window.once('ready-to-show', () => {
    sendWindowState(window)
  })
}
