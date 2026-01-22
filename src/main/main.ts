import { app, BrowserWindow } from 'electron'
import { createWindow } from './app/create-window'

import { electronApp } from '@electron-toolkit/utils'
import { createTray } from './app/create-tray'
import { ipcRegister } from './ipc/register-ipc'
import { applyAutoLaunch } from './modules/settings/settings.controller'

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
    try {
      applyAutoLaunch()

      electronApp.setAppUserModelId('AFD.APP')

      const window = createWindow()
      createTray()

      ipcRegister(window)
    } catch (error) {
      throw new Error(`Ошибка при инициализации приложения: ${error}}`)
    }
  })
}
