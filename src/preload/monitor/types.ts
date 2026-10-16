import type {
  MonitorCapabilities,
  MonitorSample,
  SensorActionResult,
  SensorActionResponse,
  SensorStatus
} from '@/shared_app/types'

export interface IMonitorApp {
  getSnapshot: (force?: boolean) => Promise<MonitorSample | null>
  getCapabilities: () => Promise<MonitorCapabilities>
  getSensorStatus: () => Promise<SensorStatus>
  installSensors: () => Promise<SensorActionResponse>
  launchSensors: () => Promise<SensorActionResponse>
  openSensorsSite: () => Promise<SensorActionResult>
}
