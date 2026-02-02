import { useCallback } from 'react'
import { logger } from '@/shared/lib/logger'

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

interface UseLoggerReturn {
  fatal: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  info: (message: string, meta?: Record<string, unknown>) => void
  debug: (message: string, meta?: Record<string, unknown>) => void
  trace: (message: string, meta?: Record<string, unknown>) => void
}

export const useLogger = (): UseLoggerReturn => {
  const createLogFn = useCallback((level: LogLevel) => {
    return (message: string, meta?: Record<string, unknown>) => {
      logger[level](message, meta)
    }
  }, [])

  return {
    fatal: createLogFn('fatal'),
    error: createLogFn('error'),
    warn: createLogFn('warn'),
    info: createLogFn('info'),
    debug: createLogFn('debug'),
    trace: createLogFn('trace')
  }
}
