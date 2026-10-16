import type { MonitorSample, MonitorSnapshot } from '@/shared_app/types'
import { loadNativeMonitor } from './native-loader'

/**
 * Native snapshots are cheap (~13 ms for every metric), but polling faster than
 * the UI can paint is wasted work and needless CPU. The service therefore serves
 * a cached snapshot and only re-reads once the cache is older than this window,
 * so several IPC calls in the same tick share one native read.
 */
const CACHE_TTL_MS = 500

let cachedSnapshot: MonitorSnapshot | null = null
let cachedAt = 0

export const initializeMonitor = (): { cpu: boolean; sensors: boolean } => {
  const monitor = loadNativeMonitor()
  if (monitor === null) {
    return { cpu: false, sensors: false }
  }

  try {
    return monitor.initialize()
  } catch {
    return { cpu: false, sensors: false }
  }
}

export const shutdownMonitor = (): void => {
  const monitor = loadNativeMonitor()
  if (monitor === null) {
    return
  }

  try {
    monitor.shutdown()
  } catch {
    // Shutdown failures must never block app exit.
  }
}

export const isMonitorAvailable = (): boolean => loadNativeMonitor() !== null

export const areSensorsAvailable = (): boolean => {
  const monitor = loadNativeMonitor()
  if (monitor === null) {
    return false
  }

  try {
    return monitor.sensorsAvailable()
  } catch {
    return false
  }
}

/**
 * Returns a system snapshot, reusing the cached one while it is still fresh.
 * Resolves to `null` when the native addon is unavailable.
 */
export const getSnapshot = (force = false): MonitorSample | null => {
  const monitor = loadNativeMonitor()
  if (monitor === null) {
    return null
  }

  const now = Date.now()
  const isFresh = cachedSnapshot !== null && now - cachedAt < CACHE_TTL_MS

  if (!force && isFresh && cachedSnapshot !== null) {
    return { snapshot: cachedSnapshot, ageMs: now - cachedAt }
  }

  try {
    const snapshot = monitor.getSnapshot()
    cachedSnapshot = snapshot
    cachedAt = now
    return { snapshot, ageMs: 0 }
  } catch {
    // Fall back to the last good sample rather than returning nothing.
    if (cachedSnapshot !== null) {
      return { snapshot: cachedSnapshot, ageMs: now - cachedAt }
    }
    return null
  }
}
