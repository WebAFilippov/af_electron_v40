type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

interface Logger {
  fatal: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  info: (message: string, meta?: Record<string, unknown>) => void
  debug: (message: string, meta?: Record<string, unknown>) => void
  trace: (message: string, meta?: Record<string, unknown>) => void
}

const sendLog = (level: LogLevel, message: string, meta?: Record<string, unknown>): void => {
  if (window.log_app && window.log_app.log) {
    window.log_app.log(level, message, meta)
  }
}

export const logger: Logger = {
  fatal: (message, meta) => sendLog('fatal', message, meta),
  error: (message, meta) => sendLog('error', message, meta),
  warn: (message, meta) => sendLog('warn', message, meta),
  info: (message, meta) => sendLog('info', message, meta),
  debug: (message, meta) => sendLog('debug', message, meta),
  trace: (message, meta) => sendLog('trace', message, meta)
}
