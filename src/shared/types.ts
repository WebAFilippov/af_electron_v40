import { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater'

export const channels = {
  settings_get_by_property: 'settings:get_by_property',
  settings_set_autolaunch: 'settings:setAutoLaunch',
  settings_set_startMinimaze: 'settings:setStartMinimized',
  settings_set_language: 'settings:set_language',
  settings_set_checkForUpdatesOnStartup: 'settings:set_checkForUpdatesOnStartup',

  theme_get_theme: 'settings:get_theme',
  theme_set_theme: 'settings:set_theme',
  theme_on_update: 'settings:on_update',

  i18next_change_language: 'i18next:change_language',
  i18next_get_language: 'i18next:get_language',
  i18next_get_resources: 'i18next:get_resources',

  updater_get_releases: 'updater:get_releases',

  monitor_get_snapshot: 'monitor:get_snapshot',
  monitor_get_capabilities: 'monitor:get_capabilities',
  monitor_get_sensor_status: 'monitor:get_sensor_status',
  monitor_install_sensors: 'monitor:install_sensors',
  monitor_launch_sensors: 'monitor:launch_sensors',
  monitor_open_sensors_site: 'monitor:open_sensors_site',

  window_on_update: 'window:on_update',
  window_fullscreen: 'window:toggle-fullscreen',
  window_minimaze: 'window:minimize',
  window_maximaze: 'window:maximize',
  window_close: 'window:close'
} as const

export interface WindowAppProps {
  minimize: boolean
  maximize: boolean
  fullscreen: boolean
  show: boolean
}

export interface SettingsProps {
  version: string
  autoLaunch: boolean
  startMinimized: boolean
  checkForUpdatesOnStartup: boolean
}

export interface LocationProps {
  version: string
  autoLaunch: boolean
  startMinimized: boolean
  checkForUpdatesOnStartup: boolean
}

export type Location = {
  id: string | number
  latitude: number
  longitude: number
  timezone: string
  city: string
  region?: string
  country: string
}

export const SUPPORTED_LANGUAGES: LanguageApp[] = ['ru', 'en']
export type LanguageApp = 'ru' | 'en'
export interface LanguageProps {
  language: LanguageApp
}

export type ThemeProps = {
  mode: 'system' | 'dark' | 'light'
  darken: boolean
}

export interface ReleaseNoteProps {
  version: string
  note: string | null
}

export interface ReleaseProps {
  id: number
  version: string
  name: string | null
  notes: string | null
  publishedAt: string
  isPrerelease: boolean
  htmlUrl: string
}

/* ------------------------------------------------------------------ *
 * System monitor
 *
 * These mirror the shape produced by the native addon
 * (src/main/native/src/addon.cc) and are shared by all three processes so the
 * main process, the preload bridge and the renderer agree on one contract.
 * ------------------------------------------------------------------ */

export interface MonitorCpuInfo {
  name: string
  physicalCores: number
  logicalCores: number
  maxClockMhz: number
  currentClockMhz: number
  loadPercent: number
  coresLoad: number[]
}

export interface MonitorMemoryInfo {
  available: boolean
  total: number
  used: number
  free: number
  cached: number
  loadPercent: number
  commitTotal: number
  commitUsed: number
}

export interface MonitorVolumeInfo {
  mountPoint: string
  label: string
  fileSystem: string
  driveType: string
  total: number
  used: number
  free: number
  usagePercent: number
}

export interface MonitorPhysicalDiskInfo {
  device: string
  model: string
  vendor: string
  serial: string
  busType: string
  size: number
  bytesPerSector: number
  isRemovable: boolean
  hasHealthData: boolean
  healthy: boolean
}

export interface MonitorNetworkInfo {
  ifIndex: number
  name: string
  description: string
  type: 'ethernet' | 'wifi' | 'loopback' | 'tunnel' | 'ppp' | 'firewire' | 'atm' | 'other'
  status: string
  mac: string
  ip4: string
  ip6: string
  prefixLength: number
  isUp: boolean
  mtu: number
  receiveBytes: number
  transmitBytes: number
  receiveBytesPerSec: number
  transmitBytesPerSec: number
  maxSpeedMbps: number
}

export interface MonitorGpuInfo {
  name: string
  vendor: string
  vendorId: number
  deviceId: number
  luid: number
  dedicatedVram: number
  dedicatedSystemMemory: number
  sharedSystemMemory: number
  displayWidth: number
  displayHeight: number
  refreshRateHz: number
}

/** Category of a LibreHardwareMonitor reading. */
export type SensorCategory = 'temperature' | 'load' | 'fan' | 'power' | 'clock' | 'voltage' | 'memory' | 'other'

export interface MonitorSensorReading {
  identifier: string
  name: string
  category: SensorCategory
  /** Parent hardware, e.g. "AMD Ryzen 5 5600G with Radeon Graphics". */
  hardware: string
  /** Group inside the hardware, e.g. "Temperatures" or "Fans". */
  group: string
  /** Numeric value; the unit depends on `category` (°C, %, RPM, W, MHz, V, GB). */
  value: number
  /** Original formatted string from LibreHardwareMonitor, e.g. "68,0 C". */
  displayValue: string
}

export interface MonitorSensorsInfo {
  available: boolean
  provider: string
  readings: MonitorSensorReading[]
  /** Why the last probe failed; empty once readings are available. */
  diagnostics: string
}

export interface MonitorSystemInfo {
  available: boolean
  hostname: string
  manufacturer: string
  model: string
  biosVersion: string
  biosDate: string
  osName: string
  osVersion: string
  osBuild: string
  architecture: string
  uptimeSeconds: number
  bootTimeMs: number
  isAdmin: boolean
}

export interface MonitorSnapshot {
  timestamp: number
  cpu: MonitorCpuInfo
  memory: MonitorMemoryInfo
  volumes: MonitorVolumeInfo[]
  physicalDisks: MonitorPhysicalDiskInfo[]
  network: MonitorNetworkInfo[]
  gpus: MonitorGpuInfo[]
  sensors: MonitorSensorsInfo
  system: MonitorSystemInfo
}

export interface MonitorSample {
  snapshot: MonitorSnapshot
  /** Milliseconds elapsed since the snapshot was captured. */
  ageMs: number
}

export interface MonitorCapabilities {
  available: boolean
  sensors: boolean
}

/** Where the temperature provider stands, as reported by the main process. */
export type SensorProviderState = 'active' | 'installed' | 'missing' | 'unsupported'

export interface SensorStatus {
  /** The WMI provider answers right now, so temperatures are readable. */
  active: boolean
  /** LibreHardwareMonitor exists on disk. */
  installed: boolean
  executablePath: string | null
  /** winget can be used to install the provider. */
  wingetAvailable: boolean
  /** PawnIO (or the legacy WinRing0) kernel driver is present. */
  driverInstalled: boolean
  state: SensorProviderState
}

export interface SensorActionResult {
  ok: boolean
  message: string
}

/** Result of an install/launch action, carrying the refreshed provider status. */
export type SensorActionResponse = SensorActionResult & { status: SensorStatus }

export type UpdateStatusDto =
  | 'idle'
  | 'error'
  | 'checking-for-update'
  | 'update-available'
  | 'update-not-available'
  | 'update-downloaded'
  | 'download-progress'

export type UpdateDataDto =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      data: {
        error: Error
        message: string | undefined
      }
    }
  | {
      status: 'checking-for-update'
    }
  | { status: 'update-available'; data: UpdateInfo }
  | { status: 'update-not-available'; data: UpdateInfo }
  | { status: 'update-downloaded'; data: UpdateDownloadedEvent }
  | { status: 'download-progress'; data: ProgressInfo }
