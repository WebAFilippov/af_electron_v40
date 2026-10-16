import { ipcMain } from 'electron/main'

import { channels } from '@/shared_app/types'
import { areSensorsAvailable, getSnapshot, isMonitorAvailable } from './service'
import {
  getSensorStatus,
  installSensorProvider,
  launchSensorProvider,
  openSensorProviderWebsite
} from './sensors-provider'

export const ipcSystemMonitor = (): void => {
  ipcMain.handle(channels.monitor_get_snapshot, (_event, force?: boolean) => {
    const sample = getSnapshot(force === true)
    return sample
  })

  ipcMain.handle(channels.monitor_get_capabilities, () => ({
    available: isMonitorAvailable(),
    sensors: areSensorsAvailable()
  }))

  ipcMain.handle(channels.monitor_get_sensor_status, () => getSensorStatus())

  ipcMain.handle(channels.monitor_install_sensors, async () => {
    const result = await installSensorProvider()
    // Re-probe immediately so the UI can show whether the provider came up
    // without waiting for the next poll.
    return { ...result, status: await getSensorStatus() }
  })

  ipcMain.handle(channels.monitor_launch_sensors, async () => {
    const result = await launchSensorProvider()
    return { ...result, status: await getSensorStatus() }
  })

  ipcMain.handle(channels.monitor_open_sensors_site, async () => {
    await openSensorProviderWebsite()
    return { ok: true, message: 'opened' }
  })
}
