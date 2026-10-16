import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Monitor, Thermometer } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui'
import { formatBytes } from '../utils/format'
import { $snapshot } from '../model/monitor'
import { UsageBar, toneForUsage } from './usage-bar'

export const GpuCard = (): ReactNode => {
  const t = useUnit($t)
  const snapshot = useUnit($snapshot)

  if (snapshot === null) {
    return null
  }

  const { gpus, sensors } = snapshot

  // GPU sensors only exist when LibreHardwareMonitor is running, and their names
  // vary by vendor, so each metric is matched by a permissive pattern.
  const readings = sensors.readings
  const gpuTemperature = readings.find(
    (reading) => reading.category === 'temperature' && /gpu|edge|hotspot|junction/i.test(reading.name)
  )
  const gpuLoad = readings.find(
    (reading) => reading.category === 'load' && /^(GPU Core|D3D 3D)$/i.test(reading.name)
  )
  const gpuMemoryUsed = readings.find(
    (reading) => reading.category === 'memory' && /GPU Memory Used|D3D Dedicated Memory Used/i.test(reading.name)
  )
  const gpuPower = readings.find((reading) => reading.category === 'power' && /gpu/i.test(reading.hardware))
  const gpuFan = readings.find((reading) => reading.category === 'fan' && /gpu/i.test(reading.hardware + reading.name))

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

        {/* Live GPU metrics are only obtainable through a hardware monitor, so
            they are shown when available and the provider card explains how to
            unlock them otherwise. */}
        {(gpuTemperature || gpuLoad || gpuMemoryUsed || gpuPower || gpuFan) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Thermometer className="h-3 w-3" />
                {t('page.monitor.gpu_live')}
              </div>

              {gpuLoad && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('page.monitor.gpu_load')}</span>
                    <span className="font-medium tabular-nums">{gpuLoad.value.toFixed(0)}%</span>
                  </div>
                  <UsageBar value={gpuLoad.value} tone={toneForUsage(gpuLoad.value)} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 text-sm">
                {gpuTemperature && (
                  <div>
                    <div className="text-muted-foreground">{t('page.monitor.gpu_temperature')}</div>
                    <div className="font-medium tabular-nums">{gpuTemperature.value.toFixed(0)}°C</div>
                  </div>
                )}
                {gpuMemoryUsed && (
                  <div>
                    <div className="text-muted-foreground">{t('page.monitor.gpu_memory_used')}</div>
                    <div className="font-medium tabular-nums">{gpuMemoryUsed.displayValue}</div>
                  </div>
                )}
                {gpuPower && (
                  <div>
                    <div className="text-muted-foreground">{t('page.monitor.gpu_power')}</div>
                    <div className="font-medium tabular-nums">{gpuPower.displayValue}</div>
                  </div>
                )}
                {gpuFan && (
                  <div>
                    <div className="text-muted-foreground">{t('page.monitor.gpu_fan')}</div>
                    <div className="font-medium tabular-nums">{gpuFan.displayValue}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
