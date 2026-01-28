import { app, BrowserWindow } from 'electron'

import { electronApp } from '@electron-toolkit/utils'
import { createTray } from './app/create-tray'

import { applyAutoLaunch } from './modules/settings/settings.controller'
import { ipcRegister } from './ipc/register-ipc'
import { createWindow } from './app/create-window'
import { i18nextInit } from './modules/i18next/i18next.service'
import { autoUpdater } from './modules/auto-updater/auto-apdater.service'
import { ipcUpdater } from './modules/auto-updater/auto-update.controller'

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
      await i18nextInit()

      applyAutoLaunch()
      electronApp.setAppUserModelId('AFD.APP')

      const window = createWindow()
      createTray()
      const updt = autoUpdater()

      ipcRegister(window)
      ipcUpdater(updt)
    } catch (error) {
      throw new Error(`Ошибка при инициализации приложения: ${error}}`)
    }
  })
}
