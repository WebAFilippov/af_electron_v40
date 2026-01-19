import { app, BrowserWindow } from 'electron'
import { createWindow } from './app/create-window'

import { electronApp } from '@electron-toolkit/utils'
import { createTray } from './app/create-tray'
import { RegisterIPC } from './ipc/register-ipc'
import { setAutoLaunch } from './modules/settings/settings.controller'
// import { loggerInit, logger } from './shared/utils/logger'


setAutoLaunch()
// loggerInit()

const gotTheLock = app.requestSingleInstanceLock()

// logger.info('hello world')

// const child = logger.child({ a: 'property' })
import pino from "pino";

const logger = pino({
  destination: pino.destination({
    dest: './logs/app.log',
    sync: false,  // Асинхронная запись
    append: true, // Дописывать в конец
    mkdir: true   // Создать папку logs, если её нет
  })
});
logger.info('log with parameters');


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

      const window = createWindow()
      createTray()

      RegisterIPC(window)

      // logger.debug('Приложение запущено')
    } catch (error) {
      // logger.error('Ошибка при инициализации приложения', error)
    }
  })
}

// C:\Users\webdev\AppData\Roaming\af_electron
