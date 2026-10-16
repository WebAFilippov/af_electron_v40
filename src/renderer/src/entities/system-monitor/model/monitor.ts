import { createEffect, createEvent, createStore, sample } from 'effector'
import { interval, not, or } from 'patronum'
import { persist } from 'effector-storage/local'

import type {
  MonitorCapabilities,
  MonitorSample,
  MonitorSnapshot,
  SensorActionResult,
  SensorActionResponse,
  SensorStatus
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
const fetchSensorStatusFx = createEffect<void, SensorStatus>(() => window.monitor_app.getSensorStatus())

const installSensorsFx = createEffect<void, SensorActionResponse>(() => window.monitor_app.installSensors())
const launchSensorsFx = createEffect<void, SensorActionResponse>(() => window.monitor_app.launchSensors())
const openSensorsSiteFx = createEffect<void, SensorActionResult>(() => window.monitor_app.openSensorsSite())

const startMonitoring = createEvent()
const stopMonitoring = createEvent()
const setPollInterval = createEvent<PollInterval>()
const pushHistory = createEvent<MonitorSnapshot>()

const $snapshot = createStore<MonitorSnapshot | null>(null).on(
  fetchSnapshotFx.doneData,
  (_, sample) => sample?.snapshot ?? null
)

const $capabilities = createStore<MonitorCapabilities>({ available: false, sensors: false }).on(
  fetchCapabilitiesFx.doneData,
  (_, capabilities) => capabilities
)

const $isPending = fetchSnapshotFx.pending
const $isAvailable = $capabilities.map((capabilities) => capabilities.available)
const $sensorsAvailable = $capabilities.map((capabilities) => capabilities.sensors)

const INITIAL_SENSOR_STATUS: SensorStatus = {
  active: false,
  installed: false,
  executablePath: null,
  wingetAvailable: false,
  driverInstalled: false,
  state: 'missing'
}

// Every provider action returns the refreshed status, so the store stays in sync
// without a separate round trip.
const $sensorStatus = createStore<SensorStatus>(INITIAL_SENSOR_STATUS)
  .on(fetchSensorStatusFx.doneData, (_, status) => status)
  .on(installSensorsFx.doneData, (_, result) => result.status)
  .on(launchSensorsFx.doneData, (_, result) => result.status)

const $isSensorActionPending = or(installSensorsFx.pending, launchSensorsFx.pending)

// The last action outcome, used to surface winget/UAC failures in the UI.
const $sensorActionMessage = createStore<string | null>(null)
  .on([installSensorsFx.doneData, launchSensorsFx.doneData], (_, result) => (result.ok ? null : result.message))
  .on([installSensorsFx, launchSensorsFx], () => null)
  .reset(stopMonitoring)

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

// eslint-disable-next-line effector/require-pickup-in-persist
persist({ store: $pollInterval, key: 'monitor-poll-interval' })

const $isMonitoring = createStore(false)
  .on(startMonitoring, () => true)
  .on(stopMonitoring, () => false)

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

// Capabilities are probed once when monitoring starts, so the UI can explain
// why temperatures are missing instead of rendering an empty block.
sample({
  clock: startMonitoring,
  target: [fetchCapabilitiesFx, fetchSensorStatusFx]
})

// After an install or launch, the WMI provider may need a moment to come up, so
// the status and one fresh snapshot are re-read with a short delay.
sample({
  clock: [installSensorsFx.doneData, launchSensorsFx.doneData],
  filter: (result) => result.ok,
  target: fetchSensorStatusFx
})

sample({
  clock: [installSensorsFx.doneData, launchSensorsFx.doneData],
  filter: (result) => result.ok,
  target: fetchSnapshotFx
})

export {
  $capabilities,
  $history,
  $isAvailable,
  $isMonitoring,
  $isPending,
  $isSensorActionPending,
  $pollInterval,
  $sensorActionMessage,
  $sensorStatus,
  $sensorsAvailable,
  $snapshot,
  fetchCapabilitiesFx,
  fetchSensorStatusFx,
  fetchSnapshotFx,
  installSensorsFx,
  launchSensorsFx,
  openSensorsSiteFx,
  setPollInterval,
  startMonitoring,
  stopMonitoring
}
