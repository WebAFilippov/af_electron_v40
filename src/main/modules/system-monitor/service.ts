import type { MonitorSample, MonitorSnapshot, TerminateProcessResult } from '@/shared_app/types'
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

/**
 * Returns a system snapshot, reusing the cached one while it is still fresh.
 * Resolves to `null` when the native addon is unavailable.
 */
export const getSnapshot = async (force = false): Promise<MonitorSample | null> => {
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

/**
 * Terminates a process.
 *
 * The protection list is enforced inside the native addon, so this wrapper does
 * not need to duplicate it — and deliberately does not, so there is a single
 * place where the safety rule lives.
 *
 * The cached snapshot is invalidated afterwards: the process table changed, and
 * serving a stale list would show a process the user just killed.
 */
export const terminateProcess = (pid: number): TerminateProcessResult => {
  const monitor = loadNativeMonitor()

  if (monitor === null) {
    return { ok: false, status: 'failed', errorCode: 0 }
  }

  try {
    const result = monitor.terminateProcess(pid)
    cachedSnapshot = null
    return result
  } catch {
    return { ok: false, status: 'failed', errorCode: 0 }
  }
}

/**
 * Drops the CPU deltas held by the native layer.
 *
 * Called when monitoring stops, so a later session does not compute process CPU
 * percentages against a sample taken minutes ago — that would report a spike
 * proportional to however long the page was closed.
 */
export const resetProcessHistory = (): void => {
  const monitor = loadNativeMonitor()
  if (monitor === null) {
    return
  }

  try {
    monitor.resetProcesses()
  } catch {
    // Nothing to recover from.
  }
}
