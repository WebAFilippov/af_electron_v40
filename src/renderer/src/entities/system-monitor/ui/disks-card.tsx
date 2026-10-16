import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { CheckCircle2, HardDrive, ShieldAlert } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui'
import { formatBytes } from '../utils/format'
import { $snapshot } from '../model/monitor'
import { UsageBar, toneForUsage } from './usage-bar'

export const DisksCard = (): ReactNode => {
  const t = useUnit($t)
  const snapshot = useUnit($snapshot)

  if (snapshot === null) {
    return null
  }

  const { volumes, physicalDisks } = snapshot

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <HardDrive className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-base">{t('page.monitor.disks_title')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('page.monitor.disks_description')}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Logical volumes */}
        {volumes.map((volume) => (
          <div key={volume.mountPoint} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{volume.mountPoint}</span>
                {volume.label && <span className="text-muted-foreground">{volume.label}</span>}
                <Badge variant="outline" className="text-xs">
                  {volume.fileSystem}
                </Badge>
              </div>
              <span className="text-muted-foreground tabular-nums">
                {formatBytes(volume.used)} / {formatBytes(volume.total)}
              </span>
            </div>
            <UsageBar value={volume.usagePercent} tone={toneForUsage(volume.usagePercent)} />
            <div className="text-xs text-muted-foreground tabular-nums">
              {t('page.monitor.disks_free', { value: formatBytes(volume.free) })} · {volume.usagePercent.toFixed(0)}%
            </div>
          </div>
        ))}

        {/* Physical devices with health where the driver exposes it */}
        {physicalDisks.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">{t('page.monitor.disks_physical')}</div>
              {physicalDisks.map((disk) => (
                <div key={disk.device} className="flex items-start justify-between gap-3 text-sm">
                  <div className="space-y-0.5">
                    <div className="font-medium">
                      {disk.model || t('page.monitor.disks_unknown_model')}
                      {disk.vendor ? ` · ${disk.vendor}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2 text-xs">
                        {disk.busType}
                      </Badge>
                      {formatBytes(disk.size)}
                    </div>
                  </div>

                  {disk.hasHealthData && (
                    <Badge variant={disk.healthy ? 'default' : 'destructive'} className="gap-1 text-xs">
                      {disk.healthy ? <CheckCircle2 className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      {disk.healthy ? t('page.monitor.disks_healthy') : t('page.monitor.disks_failing')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
