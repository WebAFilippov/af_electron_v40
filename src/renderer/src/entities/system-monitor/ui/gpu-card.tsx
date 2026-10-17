import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Monitor } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { formatBytes } from '../utils/format'
import { $snapshot } from '../model/monitor'

export const GpuCard = (): ReactNode => {
  const t = useUnit($t)
  const snapshot = useUnit($snapshot)

  if (snapshot === null) {
    return null
  }

  const { gpus } = snapshot

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-base">{t('page.monitor.gpu_title')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('page.monitor.gpu_description')}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {gpus.length === 0 && <div className="text-sm text-muted-foreground">{t('page.monitor.gpu_none')}</div>}

        {gpus.map((gpu) => (
          <div key={gpu.luid} className="space-y-2 border-t pt-3 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{gpu.name}</span>
                <Badge variant="outline" className="text-xs">
                  {gpu.vendor}
                </Badge>
              </div>
              {gpu.displayWidth > 0 && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {gpu.displayWidth}×{gpu.displayHeight}
                  {gpu.refreshRateHz > 0 ? ` @ ${gpu.refreshRateHz} Hz` : ''}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <div className="text-muted-foreground">{t('page.monitor.gpu_vram')}</div>
                <div className="font-medium tabular-nums">{formatBytes(gpu.dedicatedVram)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('page.monitor.gpu_shared')}</div>
                <div className="font-medium tabular-nums">{formatBytes(gpu.sharedSystemMemory)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('page.monitor.gpu_device_id')}</div>
                <div className="font-medium tabular-nums">
                  0x{gpu.deviceId.toString(16).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Adapter details come from DXGI. Temperature, load, power and fan would
            require the kernel driver, so they are not offered at all. */}
      </CardContent>
    </Card>
  )
}
