import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { MemoryStick } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { formatBytes } from '../utils/format'
import { $history, $snapshot } from '../model/monitor'
import { Sparkline } from './sparkline'
import { UsageBar, toneForUsage } from './usage-bar'

export const MemoryCard = (): ReactNode => {
  const t = useUnit($t)
  const [snapshot, history] = useUnit([$snapshot, $history])

  if (snapshot === null) {
    return null
  }

  const { memory } = snapshot
  if (!memory.available) {
    return null
  }

  const memoryHistory = history.map((point) => point.memory)
  const commitPercent = memory.commitTotal > 0 ? (memory.commitUsed / memory.commitTotal) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MemoryStick className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base">{t('page.monitor.memory_title')}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatBytes(memory.used)} / {formatBytes(memory.total)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold tabular-nums leading-none">{memory.loadPercent.toFixed(0)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">{t('page.monitor.memory_used')}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* The secondary bar shows the cached portion, which Windows counts as
            "in use" visually but is reclaimable. */}
        <UsageBar
          value={memory.loadPercent}
          secondaryValue={memory.total > 0 ? (memory.cached / memory.total) * 100 : 0}
          tone={toneForUsage(memory.loadPercent)}
        />
        <Sparkline data={memoryHistory} max={100} tone="green" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <div className="text-muted-foreground">{t('page.monitor.memory_free')}</div>
            <div className="font-medium tabular-nums">{formatBytes(memory.free)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('page.monitor.memory_cached')}</div>
            <div className="font-medium tabular-nums">{formatBytes(memory.cached)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('page.monitor.memory_commit')}</div>
            <div className="font-medium tabular-nums">
              {formatBytes(memory.commitUsed)} / {formatBytes(memory.commitTotal)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('page.monitor.memory_commit_load')}</div>
            <div className="font-medium tabular-nums">{commitPercent.toFixed(0)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
