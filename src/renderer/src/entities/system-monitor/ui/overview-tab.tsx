import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Activity, ArrowDown, ArrowUp, BatteryCharging, BatteryMedium, HardDrive, MemoryStick } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { $history, $snapshot } from '../model/monitor'
import { formatBytes, formatSpeed, formatUptime } from '../utils/format'
import { Sparkline } from './sparkline'
import { UsageBar, toneForUsage as barToneForUsage } from './usage-bar'

interface MetricTileProps {
  icon: ReactNode
  label: string
  value: string
  /** Secondary line under the value, e.g. "11.4 / 13.9 GB". */
  detail?: string
  percent: number
  history: number[]
  /** Tone for the trend chart, which uses a different palette from the bar. */
  tone: 'primary' | 'green' | 'amber' | 'destructive'
}

/** A single headline metric with its trend, used four times on the overview. */
const MetricTile = ({ icon, label, value, detail, percent, history, tone }: MetricTileProps): ReactNode => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-2xl font-semibold tabular-nums leading-none">{value}</span>
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
      <UsageBar value={percent} tone={barToneForUsage(percent)} />
      <Sparkline data={history} max={100} tone={tone} />
    </CardContent>
  </Card>
)

export const OverviewTab = (): ReactNode => {
  const t = useUnit($t)
  const [snapshot, history] = useUnit([$snapshot, $history])

  if (snapshot === null) {
    return null
  }

  const { cpu, memory, volumes, network, system, processes, connections, battery } = snapshot

  const cpuHistory = history.map((point) => point.cpu)
  const memoryHistory = history.map((point) => point.memory)

  const totalRx = network.reduce((sum, adapter) => sum + adapter.receiveBytesPerSec, 0)
  const totalTx = network.reduce((sum, adapter) => sum + adapter.transmitBytesPerSec, 0)

  // The system volume is the meaningful headline; other volumes are secondary.
  const primaryVolume = volumes.find((volume) => volume.mountPoint === 'C:') ?? volumes[0]

  const established = connections.filter((connection) => connection.state === 'established').length

  return (
    <div className="space-y-6">
      {/* Three headline metrics. A fourth tile was removed: the only candidate was
          the clock speed, which reads as a permanent red bar at its normal value
          and duplicates the thread count already shown under CPU. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile
          icon={<Activity className="h-4 w-4" />}
          label={t('page.monitor.overview_cpu')}
          value={`${cpu.loadPercent.toFixed(0)}%`}
          detail={`${cpu.logicalCores} ${t('page.monitor.overview_threads')} · ${cpu.name}`}
          percent={cpu.loadPercent}
          history={cpuHistory}
          tone="primary"
        />

        <MetricTile
          icon={<MemoryStick className="h-4 w-4" />}
          label={t('page.monitor.overview_memory')}
          value={`${memory.loadPercent.toFixed(0)}%`}
          detail={`${formatBytes(memory.used)} / ${formatBytes(memory.total)}`}
          percent={memory.loadPercent}
          history={memoryHistory}
          tone="green"
        />

        <MetricTile
          icon={<HardDrive className="h-4 w-4" />}
          label={t('page.monitor.overview_disk')}
          value={primaryVolume ? `${primaryVolume.usagePercent.toFixed(0)}%` : '—'}
          detail={
            primaryVolume
              ? `${primaryVolume.mountPoint} · ${formatBytes(primaryVolume.free)} ${t('page.monitor.overview_free')}`
              : undefined
          }
          percent={primaryVolume?.usagePercent ?? 0}
          history={[]}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('page.monitor.overview_network')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowDown className="h-3.5 w-3.5 text-green-500" />
                {t('page.monitor.network_rx')}
              </span>
              <span className="font-medium tabular-nums">{formatSpeed(totalRx)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowUp className="h-3.5 w-3.5 text-blue-500" />
                {t('page.monitor.network_tx')}
              </span>
              <span className="font-medium tabular-nums">{formatSpeed(totalTx)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('page.monitor.overview_connections')}</span>
              <span className="font-medium tabular-nums">{established}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('page.monitor.overview_system')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('page.monitor.system_os')}</span>
              <span className="font-medium">{system.osName || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('page.monitor.system_uptime')}</span>
              <span className="font-medium tabular-nums">{formatUptime(system.uptimeSeconds)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('page.monitor.overview_processes')}</span>
              <span className={cn('font-medium tabular-nums')}>{processes.length}</span>
            </div>

            {/* Battery is only meaningful on a laptop, so a desktop hides the row
                rather than showing a permanent "no battery". */}
            {battery.hasBattery && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('page.monitor.overview_battery')}</span>
                <span className="flex items-center gap-1.5 font-medium tabular-nums">
                  {battery.charging ? (
                    <BatteryCharging className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                  ) : (
                    <BatteryMedium className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {battery.percent}%
                  {battery.state === 'charging' && (
                    <span className="text-xs text-muted-foreground">· {t('page.monitor.overview_battery_charging')}</span>
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
