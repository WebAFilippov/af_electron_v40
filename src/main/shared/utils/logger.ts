import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { join } from 'path'
import pino from 'pino'
import { Temporal } from '@js-temporal/polyfill'
import { Config } from '../config'
import { hostname } from 'os'

// Определяем путь к логам в зависимости от режима
const getLogPath = (): string => {
  if (is.dev) {
    // В dev режиме - рядом с проектом в папке logs/
    return join(process.cwd(), 'logs')
  } else {
    // В prod режиме - в userData
    return join(Config.pathUserData, 'logs')
  }
}

const logDir = getLogPath()
const logFile = join(logDir, 'app')

// Базовая конфигурация pino
const baseOptions: pino.LoggerOptions = {
  level: is.dev ? 'info' : 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    bindings: (bindings) => ({
      context: 'main',
      hostname: bindings.hostname,
      pid: bindings.pid
    })
  },
  timestamp: () => {
    const now = Temporal.Now.zonedDateTimeISO()
    const date = now.toPlainDate().toString().replace(/-/g, '.')
    const time = now.toPlainTime().toString({ smallestUnit: 'second' })
    return `,"timestamp":"${date} ${time}"`
  }
}

// Создаем transport для файла с ротацией
const fileTransport = pino.transport({
  target: 'pino-roll',
  options: {
    file: logFile,
    size: '10m', // 10MB - строковое значение с единицей измерения
    frequency: 'daily',
    mkdir: true, // автоматически создавать папку
    extension: '.log',
    limit: {
      count: 2 // храним текущий + 2 архивных = 3 файла всего
    }
  }
})

// Создаем логгер
let logger: pino.Logger

if (is.dev) {
  // В dev режиме: пишем в файл (JSON) и в консоль (красивый формат)
  const prettyTransport = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      levelFirst: false
    }
  })

  logger = pino(
    baseOptions,
    pino.multistream([
      { stream: fileTransport, level: 'info' },
      { stream: prettyTransport, level: 'info' }
    ])
  )
} else {
  // В prod режиме: только в файл
  logger = pino(baseOptions, fileTransport)
}

// Перехват необработанных ошибок
export const loggerInit = (): void => {
  process.on('uncaughtException', (error) => {
    logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception')
    // Даем время на запись лога перед выходом
    setTimeout(() => {
      process.exit(1)
    }, 1000)
  })

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection')
  })

  logger.info(
    {
      logDir,
      isDev: is.dev,
      version: app.getVersion()
    },
    'Logger initialized'
  )
}

// Обработчик логов от renderer process
export const handleRendererLog = (level: string, message: string, meta?: Record<string, unknown>): void => {
  const logData = { context: 'renderer', ...meta }

  switch (level) {
    case 'fatal':
      logger.fatal(logData, message)
      break
    case 'error':
      logger.error(logData, message)
      break
    case 'warn':
      logger.warn(logData, message)
      break
    case 'info':
      logger.info(logData, message)
      break
    case 'debug':
      logger.debug(logData, message)
      break
    case 'trace':
      logger.trace(logData, message)
      break
    default:
      logger.info(logData, message)
  }
}

export { logger }
