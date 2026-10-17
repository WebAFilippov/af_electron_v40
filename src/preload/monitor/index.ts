import { ipcRenderer } from 'electron/renderer'

import { channels } from '@/shared_app/types'
import type { IMonitorApp } from './types'

export const monitor_app = {
  getSnapshot: (force) => ipcRenderer.invoke(channels.monitor_get_snapshot, force),
  getCapabilities: () => ipcRenderer.invoke(channels.monitor_get_capabilities),
  terminateProcess: (pid) => ipcRenderer.invoke(channels.monitor_terminate_process, pid)
} satisfies IMonitorApp
