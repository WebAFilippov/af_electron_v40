import type { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { Activity, RefreshCw } from 'lucide-react'

import { $t } from '@/entities/i18next'
import {
  $isAvailable,
  $isPending,
  $pollInterval,
  $snapshot,
  CpuCard,
  DisksCard,
  GpuCard,
  MemoryCard,
  NetworkCard,
  POLL_INTERVALS,
  SensorsProviderCard,
  SystemCard,
  fetchSnapshotFx,
  setPollInterval,
  type PollInterval
} from '@/entities/system-monitor'
import { Button, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { GateMonitorPage } from '../model'

export const MonitorPage = (): ReactNode => {
  useGate(GateMonitorPage)

  const t = useUnit($t)
  const [snapshot, isAvailable, isPending, pollInterval, handleSetInterval, handleRefresh] = useUnit([
    $snapshot,
    $isAvailable,
    $isPending,
    $pollInterval,
    setPollInterval,
    fetchSnapshotFx
  ])

  // The native addon is Windows-only and optional; explain the situation instead
  // of rendering a page full of zeros.
  if (!isAvailable) {
    return (
      <div className="mx-auto max-w-4xl">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Activity />
            </EmptyMedia>
            <EmptyTitle>{t('page.monitor.unavailable_title')}</EmptyTitle>
            <EmptyDescription>{t('page.monitor.unavailable_description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.monitor.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('page.monitor.description')}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Polling cadence. Lower values give smoother charts at a small CPU
              cost, so the tradeoff is left to the user. */}
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            {POLL_INTERVALS.map((interval) => (
              <button
                key={interval}
                type="button"
                onClick={() => handleSetInterval(interval as PollInterval)}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium tabular-nums transition-colors',
                  pollInterval === interval
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {interval / 1000}s
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleRefresh()} disabled={isPending}>
            <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
            {t('page.monitor.refresh')}
          </Button>
        </div>
      </div>

      {snapshot === null ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t('page.monitor.loading')}
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          {/* Explains how to unlock temperatures; hides itself once they work. */}
          <SensorsProviderCard />

          <CpuCard />
          <MemoryCard />

          <div className="grid gap-6 lg:grid-cols-2">
            <DisksCard />
            <GpuCard />
          </div>

          <NetworkCard />
          <SystemCard />
        </div>
      )}
    </div>
  )
}
