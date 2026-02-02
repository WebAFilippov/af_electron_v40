export interface ILogApp {
  toRenderer: (callback: (state: unknown) => void) => void
  log: (
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace',
    message: string,
    meta?: Record<string, unknown>
  ) => void
}
