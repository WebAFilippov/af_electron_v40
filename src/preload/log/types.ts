export interface ILogApp {
  log: (
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace',
    message: string,
    meta?: Record<string, unknown>
  ) => void
}
