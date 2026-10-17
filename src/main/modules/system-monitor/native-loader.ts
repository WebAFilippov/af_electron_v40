/**
 * Loader for the native system-monitor addon.
 *
 * The main process is bundled as ESM by electron-vite with
 * `treeshake.moduleSideEffects: false`, and Rollup cannot bundle a `.node`
 * binary at all. The addon is therefore excluded from the bundle (see the
 * `external` list in electron.vite.config.ts) and resolved here at runtime.
 *
 * The binary lives in `resources/native`, which is the project root directory in
 * development and is copied into `<app>/resources/` by `extraResources` when
 * packaged, so one expression covers both:
 *
 *  - development: `app.getAppPath()/resources/native`
 *  - packaged:    `process.resourcesPath/resources/native`
 *
 * `asarUnpack` keeps it outside the archive so the OS loader can map it.
 *
 * `createRequire` is used because `require` is not defined in ESM output.
 */

import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { app } from 'electron/main'

import type { MonitorSnapshot, TerminateProcessResult } from '@/shared_app/types'
import { logger } from '@/shared/utils/logger'

const ADDON_FILENAME = 'system_monitor.node'

interface NativeAddon {
  getSnapshot(): MonitorSnapshot
  initialize(): { cpu: boolean; sensors: boolean }
  shutdown(): void
  sensorsAvailable(): boolean
  /** Kept for contract stability; sensors are owned by the .NET helper now. */
  refreshSensors(): boolean
  /** Terminates a process; the native layer enforces the protection list. */
  terminateProcess(pid: number): TerminateProcessResult
  /** Clears the CPU deltas used to derive per-process percentages. */
  resetProcesses(): void
}

let addon: NativeAddon | null = null
let loadAttempted = false

/**
 * Directory that holds `resources/` for the current run.
 *
 * Packaged builds keep it beside the executable; development keeps it at the
 * project root, which is what `app.getAppPath()` returns there.
 */
const resourcesRoot = (): string => {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'resources')
  }

  return join(app.getAppPath(), 'resources')
}

const addonPath = (): string => join(resourcesRoot(), 'native', ADDON_FILENAME)

/**
 * Loads the addon once. Returns `null` (instead of throwing) when the binary is
 * missing or was built for a different ABI, so the rest of the app keeps working
 * without monitoring.
 */
export const loadNativeMonitor = (): NativeAddon | null => {
  if (loadAttempted) {
    return addon
  }
  loadAttempted = true

  const path = addonPath()

  if (!existsSync(path)) {
    logger.warn({ path }, 'Native system monitor not found')
    addon = null
    return null
  }

  try {
    const require = createRequire(import.meta.url)
    addon = require(path) as NativeAddon
    logger.info({ path }, 'Native system monitor loaded')
    return addon
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ path, error: message }, 'Native system monitor unavailable')
    addon = null
    return null
  }
}

export const isNativeMonitorAvailable = (): boolean => loadNativeMonitor() !== null
