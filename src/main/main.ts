import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'

import { createTray } from './app/create-tray'
import { ipcRegister } from './ipc'
import { createWindow } from './app/create-window'
import { i18nextInit } from './modules/i18next/service'
import { autoUpdater } from './modules/auto-updater/service'
import { logger, loggerInit } from './shared/utils/logger'

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
      loggerInit()
      electronApp.setAppUserModelId('AFD.APP')
      logger.info('Application starting...')

      await i18nextInit()
      logger.info('i18next initialized')

      const window = createWindow()
      const tray = createTray()
      const updater = autoUpdater()

      ipcRegister(window, tray, updater)
      logger.info('IPC handlers registered')

      logger.info('Application initialized successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.fatal({ error: errorMessage }, 'Failed to initialize application')
      throw new Error(`Ошибка при инициализации приложения: ${error}`)
    }
  })
}
