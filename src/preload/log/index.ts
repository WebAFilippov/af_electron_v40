import { ipcRenderer } from 'electron/renderer'

import { ILogApp } from './types'

export const log_app = {
  log: (level, message, meta) => {
    ipcRenderer.send('log-from-renderer', { level, message, meta })
  }
} satisfies ILogApp
