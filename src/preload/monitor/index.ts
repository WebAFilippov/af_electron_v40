import { ipcRenderer } from 'electron/renderer'

import { channels } from '@/shared_app/types'
import type { IMonitorApp } from './types'

export const monitor_app = {
  getSnapshot: (force) => ipcRenderer.invoke(channels.monitor_get_snapshot, force),
  getCapabilities: () => ipcRenderer.invoke(channels.monitor_get_capabilities),
  getSensorStatus: () => ipcRenderer.invoke(channels.monitor_get_sensor_status),
  installSensors: () => ipcRenderer.invoke(channels.monitor_install_sensors),
  launchSensors: () => ipcRenderer.invoke(channels.monitor_launch_sensors),
  openSensorsSite: () => ipcRenderer.invoke(channels.monitor_open_sensors_site)
} satisfies IMonitorApp
