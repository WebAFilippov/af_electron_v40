import { ipcMain } from 'electron/main'

import { channels } from '@/shared_app/types'
import { getSnapshot, isMonitorAvailable, terminateProcess } from './service'

export const ipcSystemMonitor = (): void => {
  ipcMain.handle(channels.monitor_get_snapshot, (_event, force?: boolean) => getSnapshot(force === true))

  ipcMain.handle(channels.monitor_get_capabilities, () => ({
    available: isMonitorAvailable()
  }))

  // The protection list lives in the native addon, so this handler only validates
  // the shape of the request and forwards it — duplicating the rule here would
  // create a second place for it to drift.
  ipcMain.handle(channels.monitor_terminate_process, (_event, pid: unknown) => {
    if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) {
      return { ok: false, status: 'failed', errorCode: 0 }
    }

    return terminateProcess(pid)
  })
}
