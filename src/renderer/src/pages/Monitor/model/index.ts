import { sample } from 'effector'
import { createGate } from 'effector-react'

import { startMonitoring, stopMonitoring } from '@/entities/system-monitor'

const GateMonitorPage = createGate()

sample({
  clock: GateMonitorPage.open,
  target: startMonitoring
})

// Polling is tied to page visibility: nothing is sampled once the user navigates
// away, so an idle window costs no CPU.
sample({
  clock: GateMonitorPage.close,
  target: stopMonitoring
})

export { GateMonitorPage }
