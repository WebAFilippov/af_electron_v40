import { sample } from 'effector'
import { createGate } from 'effector-react'

import { loadReleasesFx } from '@/entities/updater'

const GateUpdatesPage = createGate()

sample({
  clock: GateUpdatesPage.open,
  target: loadReleasesFx
})

export { GateUpdatesPage }
