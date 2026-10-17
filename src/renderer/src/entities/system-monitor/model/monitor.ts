import { createEffect, createEvent, createStore, sample } from 'effector'
import { interval, not } from 'patronum'
import { persist } from 'effector-storage/local'

import type {
  MonitorCapabilities,
  MonitorSample,
  MonitorSnapshot,
  TerminateProcessResult
} from '@/shared_app/types'

/** Polling cadence options exposed in the UI (milliseconds). */
export const POLL_INTERVALS = [1000, 2000, 5000, 10000] as const
export type PollInterval = (typeof POLL_INTERVALS)[number]

export const DEFAULT_POLL_INTERVAL: PollInterval = 2000

/**
 * Rolling window kept in memory for the sparkline charts. At the 1 s cadence
 * this covers two minutes; the ring buffer is trimmed on every sample so memory
 * stays flat regardless of how long the page is open.
 */
const HISTORY_LENGTH = 120

export interface HistoryPoint {
  timestamp: number
  cpu: number
  memory: number
  /** Aggregate throughput across all adapters, bytes per second. */
  networkRx: number
  networkTx: number
}

const fetchSnapshotFx = createEffect<void, MonitorSample | null>(() => window.monitor_app.getSnapshot())
const fetchCapabilitiesFx = createEffect<void, MonitorCapabilities>(() => window.monitor_app.getCapabilities())

/**
 * Terminates a process. The native layer refuses to kill system-critical
 * processes, so the result is surfaced rather than assumed to succeed.
 */
const terminateProcessFx = createEffect<number, TerminateProcessResult, Error>((pid) =>
  window.monitor_app.terminateProcess(pid)
)

const startMonitoring = createEvent()
const stopMonitoring = createEvent()
const setPollInterval = createEvent<PollInterval>()
const pushHistory = createEvent<MonitorSnapshot>()
/** Clears the process filter; separate from the poll interval on purpose. */
const clearProcessTerminationError = createEvent()

const $snapshot = createStore<MonitorSnapshot | null>(null).on(
  fetchSnapshotFx.doneData,
  (_, sample) => sample?.snapshot ?? null
)

const $capabilities = createStore<MonitorCapabilities>({ available: false }).on(
  fetchCapabilitiesFx.doneData,
  (_, capabilities) => capabilities
)

const $isPending = fetchSnapshotFx.pending
const $isAvailable = $capabilities.map((capabilities) => capabilities.available)

const $history = createStore<HistoryPoint[]>([])
  .on(pushHistory, (history, snapshot) => {
    const point: HistoryPoint = {
      timestamp: Date.now(),
      cpu: snapshot.cpu.loadPercent,
      memory: snapshot.memory.loadPercent,
      networkRx: snapshot.network.reduce((sum, adapter) => sum + adapter.receiveBytesPerSec, 0),
      networkTx: snapshot.network.reduce((sum, adapter) => sum + adapter.transmitBytesPerSec, 0)
    }

    const next = history.length >= HISTORY_LENGTH ? history.slice(history.length - HISTORY_LENGTH + 1) : history.slice()
    next.push(point)
    return next
  })
  .reset(stopMonitoring)

const $pollInterval = createStore<PollInterval>(DEFAULT_POLL_INTERVAL)
  .on(setPollInterval, (_, value) => value)
  .reset(stopMonitoring)

persist({ store: $pollInterval, key: 'monitor-poll-interval' })

const $isMonitoring = createStore(false)
  .on(startMonitoring, () => true)
  .on(stopMonitoring, () => false)

/**
 * Outcome of the last terminate request. `null` means nothing has been attempted
 * yet; a non-success status is kept so the UI can explain the refusal instead of
 * failing silently.
 */
const $lastTermination = createStore<{ pid: number; result: TerminateProcessResult } | null>(null)
  .on(terminateProcessFx.done, (_, { params, result }) => ({ pid: params, result }))
  .on(clearProcessTerminationError, () => null)

// Poll on the configured cadence, but never overlap two native reads.
const { tick } = interval({
  timeout: $pollInterval,
  start: sample({ clock: startMonitoring, filter: not(fetchSnapshotFx.pending) }),
  stop: stopMonitoring
})

sample({
  clock: [startMonitoring, tick],
  filter: not(fetchSnapshotFx.pending),
  target: fetchSnapshotFx
})

// The effect resolves to `null` when the native addon is unavailable, so the
// value is unwrapped before it reaches the history store. Effector cannot carry
// a type predicate from `filter` into `fn`, hence the explicit guard in `fn`.
sample({
  clock: fetchSnapshotFx.doneData,
  filter: (sample): sample is NonNullable<typeof sample> => sample !== null,
  fn: (sample) => (sample as MonitorSample).snapshot,
  target: pushHistory
})

// Capabilities are probed once when monitoring starts, so the page can explain a
// missing native addon instead of rendering an empty shell.
sample({
  clock: startMonitoring,
  target: fetchCapabilitiesFx
})

// A successful termination changes the process table, so the next snapshot is
// requested immediately rather than waiting for the poll tick.
sample({
  clock: terminateProcessFx.doneData,
  filter: (result) => result.ok,
  target: fetchSnapshotFx
})

export {
  $capabilities,
  $history,
  $isAvailable,
  $isMonitoring,
  $lastTermination,
  $isPending,
  $pollInterval,
  $snapshot,
  clearProcessTerminationError,
  fetchCapabilitiesFx,
  fetchSnapshotFx,
  setPollInterval,
  startMonitoring,
  stopMonitoring,
  terminateProcessFx
}
