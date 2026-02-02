import { ipcRenderer } from 'electron/renderer'

import { ILogApp } from './types'

export const log_app = {
  toRenderer: (callback) => {
    ipcRenderer.on('logs', (_, state: unknown) => callback(state))
  },
  log: (level, message, meta) => {
    ipcRenderer.send('log-from-renderer', { level, message, meta })
  }
} satisfies ILogApp
