import type { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { Activity, Cpu, Gauge, Network, RefreshCw, Settings2 } from 'lucide-react'

import { $t } from '@/entities/i18next'
import {
  $isAvailable,
  $pollInterval,
  $snapshot,
  ConnectionsCard,
  CpuCard,
  DisksCard,
  GpuCard,
  MemoryCard,
  NetworkCard,
  OverviewTab,
  POLL_INTERVALS,
  ProcessesCard,
  SystemCard,
  setPollInterval,
  type PollInterval
} from '@/entities/system-monitor'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/ui'
import { cn } from '@/shared/lib'
import { GateMonitorPage } from '../model'

/** Counts shown as tab badges, so a glance reveals where activity is. */
interface TabDefinition {
  value: string
  label: string
  icon: ReactNode
  badge?: number
}

export const MonitorPage = (): ReactNode => {
  useGate(GateMonitorPage)

  const t = useUnit($t)
  const [snapshot, isAvailable, pollInterval, handleSetInterval] = useUnit([
    $snapshot,
    $isAvailable,
    $pollInterval,
    setPollInterval
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

  const tabs: TabDefinition[] = [
    { value: 'overview', label: t('page.monitor.tab_overview'), icon: <Gauge /> },
    { value: 'cpu', label: t('page.monitor.tab_cpu'), icon: <Cpu /> },
    {
      value: 'processes',
      label: t('page.monitor.tab_processes'),
      icon: <Settings2 />,
      badge: snapshot?.processes.length
    },
    {
      value: 'network',
      label: t('page.monitor.tab_network'),
      icon: <Network />,
      badge: snapshot?.connections.length
    },
    { value: 'system', label: t('page.monitor.tab_system'), icon: <Activity /> }
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.monitor.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('page.monitor.description')}</p>
        </div>

        {/* Polling cadence. Lower values give smoother charts at a small CPU cost,
            so the tradeoff is left to the user. */}
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
      </div>

      {snapshot === null ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {t('page.monitor.loading')}
        </div>
      ) : (
        <>
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-0.5 rounded bg-muted-foreground/15 px-1 text-[10px] tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="cpu" className="space-y-6">
              <CpuCard />
              <MemoryCard />
            </TabsContent>

            <TabsContent value="processes">
              <ProcessesCard />
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <NetworkCard />
              <ConnectionsCard />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <SystemCard />
              <div className="grid gap-6 lg:grid-cols-2">
                <DisksCard />
                <GpuCard />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
