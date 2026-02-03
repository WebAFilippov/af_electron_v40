import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'

import { createTray } from './app/create-tray'
import { ipcRegister } from './ipc'
import { createWindow } from './app/create-window'
import { i18nextInit } from './modules/i18next/service'
import { autoUpdater } from './modules/auto-updater/service'
import { logger, loggerInit } from './shared/utils/logger'

import ym from 'yandex-music-desktop-library'
import { join } from 'path'

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

      setTimeout(async () => {
        try {
          const controller = new ym({
            executablePath: join(
              process.resourcesPath,
              'app.asar.unpacked',
              'node_modules',
              'yandex-music-desktop-library',
              'bin',
              'win-x64',
              'YandexMusicController.exe'
            ),
            thumbnailQuality: 75,
            thumbnailSize: 150
          })

          logger.info('Yandex Music controller initialized')

          controller.on('media', (media) => {
            logger.info({ media }, 'Media track received')
          })

          controller.on('volume', (volume) => {
            logger.info({ volume }, 'Volume changed')
          })

          controller.on('error', (error) => {
            logger.error({ error: error.message }, 'Yandex Music controller error')
          })

          controller.on('exit', (exit) => {
            logger.warn({ exit }, 'Yandex Music controller exited')
          })

          await controller.start()
          logger.info('Yandex Music controller started')
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error({ error: errorMessage }, 'Failed to start Yandex Music controller')
        }
      }, 5000)

      logger.info('Application initialized successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.fatal({ error: errorMessage }, 'Failed to initialize application')
      throw new Error(`Ошибка при инициализации приложения: ${error}`)
    }
  })
}
