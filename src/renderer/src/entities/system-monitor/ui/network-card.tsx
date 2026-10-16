import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { ArrowDown, ArrowUp, Network, Wifi } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { formatBytes, formatLinkSpeed, formatSpeed } from '../utils/format'
import { $history, $snapshot } from '../model/monitor'
import { Sparkline } from './sparkline'

export const NetworkCard = (): ReactNode => {
  const t = useUnit($t)
  const [snapshot, history] = useUnit([$snapshot, $history])

  if (snapshot === null) {
    return null
  }

  const adapters = snapshot.network
  const rxHistory = history.map((point) => point.networkRx)
  const txHistory = history.map((point) => point.networkTx)

  const totalRx = adapters.reduce((sum, adapter) => sum + adapter.receiveBytesPerSec, 0)
  const totalTx = adapters.reduce((sum, adapter) => sum + adapter.transmitBytesPerSec, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base">{t('page.monitor.network_title')}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('page.monitor.network_adapters', { count: adapters.length })}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-right text-sm">
            <div>
              <div className="flex items-center justify-end gap-1 text-muted-foreground">
                <ArrowDown className="h-3 w-3 text-green-500" />
                {t('page.monitor.network_rx')}
              </div>
              <div className="font-medium tabular-nums">{formatSpeed(totalRx)}</div>
            </div>
            <div>
              <div className="flex items-center justify-end gap-1 text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-blue-500" />
                {t('page.monitor.network_tx')}
              </div>
              <div className="font-medium tabular-nums">{formatSpeed(totalTx)}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t('page.monitor.network_rx')}</div>
            <Sparkline data={rxHistory} tone="green" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t('page.monitor.network_tx')}</div>
            <Sparkline data={txHistory} tone="primary" />
          </div>
        </div>

        <div className="space-y-3">
          {adapters.map((adapter) => (
            <div key={adapter.ifIndex} className="space-y-1.5 border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {adapter.type === 'wifi' ? <Wifi className="h-4 w-4 text-muted-foreground" /> : null}
                  <span className="font-medium">{adapter.name || adapter.description}</span>
                  <Badge variant={adapter.isUp ? 'default' : 'secondary'} className="text-xs">
                    {adapter.isUp ? t('page.monitor.network_up') : t('page.monitor.network_down')}
                  </Badge>
                  {adapter.maxSpeedMbps > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formatLinkSpeed(adapter.maxSpeedMbps)}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-3 text-xs tabular-nums text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowDown className="h-3 w-3" />
                    {formatSpeed(adapter.receiveBytesPerSec)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {formatSpeed(adapter.transmitBytesPerSec)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {adapter.description && adapter.name !== adapter.description && <span>{adapter.description}</span>}
                {adapter.ip4 && (
                  <span className="tabular-nums">
                    IPv4: {adapter.ip4}/{adapter.prefixLength}
                  </span>
                )}
                {adapter.ip6 && <span className="tabular-nums">IPv6: {adapter.ip6}</span>}
                {adapter.mac && <span className="tabular-nums">{adapter.mac}</span>}
                <span>
                  {t('page.monitor.network_total')}: {formatBytes(adapter.receiveBytes)} ↓ /{' '}
                  {formatBytes(adapter.transmitBytes)} ↑
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
