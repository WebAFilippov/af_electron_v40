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
  monitor_terminate_process: 'monitor:terminate_process',

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
  system: MonitorSystemInfo
  /**
   * Every running process. CPU percentages require two consecutive samples, so
   * the first snapshot after start reports zeros.
   */
  processes: MonitorProcessInfo[]
  /** Active TCP and UDP endpoints with their owning process. */
  connections: MonitorConnectionInfo[]
}

export interface MonitorSample {
  snapshot: MonitorSnapshot
  /** Milliseconds elapsed since the snapshot was captured. */
  ageMs: number
}

export interface MonitorCapabilities {
  available: boolean
}

export interface MonitorProcessInfo {
  pid: number
  parentPid: number
  threadCount: number

  name: string
  /** Full image path; empty for processes owned by another user. */
  path: string
  /** Version-resource description, e.g. "Google Chrome". */
  description: string
  /** Version-resource company, e.g. "Google LLC". */
  company: string

  /** Resident working set in bytes. */
  workingSet: number
  privateBytes: number

  /** Cumulative CPU time since the process started, in milliseconds. */
  totalCpuTimeMs: number
  /** Milliseconds since the Unix epoch; 0 when unknown. */
  startTimeMs: number

  /**
   * CPU usage over the interval since the previous sample, in percent.
   * Zero on the very first sample, because a delta needs two readings.
   */
  cpuPercent: number

  isAccessible: boolean
  /** System-critical process that the native layer refuses to terminate. */
  isProtected: boolean
  /** Whether the UI may offer to terminate this process. */
  canTerminate: boolean
}

export interface MonitorConnectionInfo {
  protocol: 'TCP' | 'UDP'
  family: 'IPv4' | 'IPv6'
  localAddress: string
  localPort: number
  /** Empty for listening sockets and for connectionless UDP. */
  remoteAddress: string
  remotePort: number
  /** "established", "listening", "time-wait", "unconnected", ... */
  state: string
  /** Owning process id; 0 when the socket is not attributable. */
  pid: number
}

/** Outcome of a terminate request, surfaced so the UI can explain a refusal. */
export type TerminateStatus = 'success' | 'protected' | 'self' | 'access-denied' | 'not-found' | 'failed'

export interface TerminateProcessResult {
  ok: boolean
  status: TerminateStatus
  /** Raw Win32 error code, 0 on success. */
  errorCode: number
}

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
