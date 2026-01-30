import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'

import { createTray } from './app/create-tray'
import { ipcRegister } from './ipc'
import { createWindow } from './app/create-window'
import { i18nextInit } from './modules/i18next/service'
import { autoUpdater } from './modules/auto-updater/service'

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
      electronApp.setAppUserModelId('AFD.APP')

      await i18nextInit()

      const window = createWindow()
      const tray = createTray()
      const updater = autoUpdater()

      ipcRegister(window, tray, updater)
    } catch (error) {
      throw new Error(`Ошибка при инициализации приложения: ${error}}`)
    }
  })
}
