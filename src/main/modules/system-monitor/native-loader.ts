/**
 * Loader for the native system-monitor addon.
 *
 * The main process is bundled as ESM by electron-vite with
 * `treeshake.moduleSideEffects: false`, and Rollup cannot bundle a `.node`
 * binary at all. The addon is therefore excluded from the bundle (see the
 * `external` list in electron.vite.config.ts) and resolved here at runtime:
 *
 *  - in development the file sits next to this module inside `out/main`;
 *  - in a packaged app it is unpacked from the asar into `app.asar.unpacked`
 *    (configured through `asarUnpack` in electron-builder.yml).
 *
 * `createRequire` is used because `require` is not defined in ESM output.
 */

import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { app } from 'electron/main'

import type { MonitorSnapshot } from '@/shared_app/types'
import { logger } from '@/shared/utils/logger'

const ADDON_FILENAME = 'system_monitor.node'

interface NativeAddon {
  getSnapshot(): MonitorSnapshot
  initialize(): { cpu: boolean; sensors: boolean }
  shutdown(): void
  sensorsAvailable(): boolean
  /** Re-probes the WMI provider; needed after LibreHardwareMonitor is started. */
  refreshSensors(): boolean
}

let addon: NativeAddon | null = null
let loadAttempted = false

const resolveAddonPath = (): string => {
  // Packaged builds unpack `resources/native` next to the asar archive; the
  // `app.asar` -> `app.asar.unpacked` rewrite mirrors the Config helper.
  const candidates = [
    join(import.meta.dirname, 'native', ADDON_FILENAME),
    join(app.getAppPath(), 'out', 'main', 'native', ADDON_FILENAME),
    join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'out', 'main', 'native', ADDON_FILENAME),
    join(process.resourcesPath ?? '', 'native', ADDON_FILENAME)
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return candidates[0]
}

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

  const addonPath = resolveAddonPath()

  try {
    const require = createRequire(import.meta.url)
    addon = require(addonPath) as NativeAddon
    logger.info({ addonPath }, 'Native system monitor loaded')
    return addon
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ addonPath, error: message }, 'Native system monitor unavailable')
    addon = null
    return null
  }
}

export const isNativeMonitorAvailable = (): boolean => loadNativeMonitor() !== null
