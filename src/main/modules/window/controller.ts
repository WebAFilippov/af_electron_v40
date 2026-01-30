import { BrowserWindow, ipcMain } from 'electron/main'

import { channels, WindowAppProps } from '@/shared_app/types'

const sendWindowState = (
  window: BrowserWindow,
  key?: 'enter-full-screen' | 'leave-full-screen'
): void => {
  const state: WindowAppProps = {
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

  window.webContents.send(channels.window_on_update, state)
}

const ipcWindow = (window: BrowserWindow): void => {
  window.once('ready-to-show', () => {
    sendWindowState(window)
  })

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
    if (input.key === 'F11' && input.type === 'keyDown' && window.isFocused()) {
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
}

export { ipcWindow }
