import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'

import { createTray } from './app/create-tray'
import { ipcRegister } from './ipc'
import { createWindow } from './app/create-window'
import { i18nextInit } from './modules/i18next/service'
import { autoUpdater } from './modules/auto-updater/service'
import { logger, loggerInit } from './shared/utils/logger'
import mqtt from 'mqtt'

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
      const BROKER_URL = 'mqtt://hub.local:1883'

      const client = mqtt.connect(BROKER_URL, {
        clientId: 'nodejs-hub-client',
        clean: true,
        reconnectPeriod: 1000
      })

      client.on('connect', () => {
        logger.info('✅ Connected to ESP32 MQTT broker')

        client.subscribe(['hub/telemetry', 'hub/status'], (err) => {
          if (err) {
            logger.error({ error: err }, '❌ Subscribe error')
          } else {
            logger.info('📡 Subscribed to telemetry & status')
          }
        })
      })

      client.on('message', (topic, payload) => {
        const message = payload.toString()

        switch (topic) {
          case 'hub/telemetry':
            handleTelemetry(message)
            break

          case 'hub/status':
            logger.info({ message }, '📟 Status')
            break

          default:
            logger.info({ topic, message }, '📨 MQTT message')
        }
      })

      client.on('error', (err) => {
        logger.error({ error: err }, '❌ MQTT error')
      })

      client.on('close', () => {
        logger.info('🔌 MQTT connection closed')
      })

      // ---------- handlers ----------

      function handleTelemetry(payload) {
        try {
          const data = JSON.parse(payload)
          logger.info({ data }, '📊 Telemetry')
        } catch {
          logger.info({ payload }, '📊 Telemetry (raw)')
        }
      }

      // ---------- commands ----------

      function sendMotorCommand(action, speed = 0) {
        const payload = JSON.stringify({
          action, // "start" | "stop" | etc
          speed // int
        })

        client.publish('hub/cmd/motor', payload)
        logger.info({ payload }, '➡️ Motor cmd')
      }

      function sendConfig(param, value) {
        const payload = JSON.stringify({
          param,
          value
        })

        client.publish('hub/cmd/config', payload)
        logger.info({ payload }, '➡️ Config cmd')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.fatal({ error: errorMessage }, 'Failed to initialize application')
      throw new Error(`Ошибка при инициализации приложения: ${error}`)
    }
  })
}
