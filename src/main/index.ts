import { app, BrowserWindow } from 'electron'
import { createWindow } from './app/create-window'

import { electronApp } from '@electron-toolkit/utils'
import { createTray } from './app/create-tray'
import { RegisterIPC } from './ipc/register-ipc'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows()
    if (window) {
      if (window.isMinimized()) {
        window.restore()
      }
      if (!window.isVisible()) {
        window.show()
      }
      window.focus()
    }
  })

  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('AFD.APP')

    const window = createWindow()
    createTray()

    RegisterIPC(window)
  })
}

// C:\Users\webdev\AppData\Roaming\af_electron
