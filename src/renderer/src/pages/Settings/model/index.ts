import { sample } from 'effector'
import { createGate } from 'effector-react'

import { fetchAutoLaunchFx } from '@/entities/auto-launch'
import { fetchCheckForUpdatesOnStartupFx } from '@/entities/check-for-updates-on-startup'
import { fetchStartMinimizedFx } from '@/entities/start-minimized'

const GateSettingsPage = createGate()

sample({
  clock: GateSettingsPage.open,
  target: [fetchStartMinimizedFx, fetchAutoLaunchFx, fetchCheckForUpdatesOnStartupFx]
})

export { GateSettingsPage }
