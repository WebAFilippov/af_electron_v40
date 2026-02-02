import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { join } from 'path'
import pino from 'pino'
import { roll } from 'pino-roll'
import { Config } from '../config'

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
const logFile = join(logDir, 'app.log')

// Настройка ротации: 10MB максимум, храним последние 3 дня
const logStream = roll(logFile, {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 3, // храним 3 файла (текущий + 2 архивных)
  dateFormat: 'yyyy-MM-dd',
  frequency: 'daily',
  extension: '.log'
})

// Базовая конфигурация pino
const baseOptions: pino.LoggerOptions = {
  level: is.dev ? 'info' : 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      context: 'main'
    })
  },
  timestamp: pino.stdTimeFunctions.isoTime
}

// Создаем логгер
let logger: pino.Logger

if (is.dev) {
  // В dev режиме: пишем и в файл и в консоль (pretty print)
  logger = pino(
    baseOptions,
    pino.multistream([
      { stream: logStream, level: 'info' },
      {
        stream: pino.destination({
          sync: false,
          dest: process.stdout.fd
        }),
        level: 'info'
      }
    ])
  )
} else {
  // В prod режиме: только в файл
  logger = pino(baseOptions, logStream)
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
