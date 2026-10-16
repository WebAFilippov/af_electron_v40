import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Cpu, Thermometer } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { formatFrequency } from '../utils/format'
import { $history, $snapshot } from '../model/monitor'
import { Sparkline } from './sparkline'
import { UsageBar, toneForUsage } from './usage-bar'

/** Colour ramp for the per-core strip: cool when idle, red when saturated. */
const coreTone = (load: number): string => {
  if (load >= 90) return 'bg-destructive'
  if (load >= 70) return 'bg-amber-500'
  if (load >= 40) return 'bg-primary'
  return 'bg-green-500/70'
}

export const CpuCard = (): ReactNode => {
  const t = useUnit($t)
  const [snapshot, history] = useUnit([$snapshot, $history])

  if (snapshot === null) {
    return null
  }

  const { cpu } = snapshot
  const cpuHistory = history.map((point) => point.cpu)

  // The sensor list carries hardware names, so the interesting readings are
  // picked by name instead of by position.
  const packageTemperature = snapshot.sensors.readings.find(
    (reading) => reading.category === 'temperature' && /Tctl|Tdie|Package|^CPU$/i.test(reading.name)
  )
  const cpuFan = snapshot.sensors.readings.find(
    (reading) => reading.category === 'fan' && /cpu/i.test(reading.name)
  )
  const packagePower = snapshot.sensors.readings.find(
    (reading) => reading.category === 'power' && /package/i.test(reading.name)
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base">{t('page.monitor.cpu_title')}</CardTitle>
              <p className="text-xs text-muted-foreground">{cpu.name}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold tabular-nums leading-none">{cpu.loadPercent.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-muted-foreground">{t('page.monitor.cpu_load')}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <UsageBar value={cpu.loadPercent} tone={toneForUsage(cpu.loadPercent)} />
        <Sparkline data={cpuHistory} max={100} tone="primary" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <div className="text-muted-foreground">{t('page.monitor.cpu_cores')}</div>
            <div className="font-medium tabular-nums">
              {cpu.physicalCores} / {cpu.logicalCores}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('page.monitor.cpu_frequency')}</div>
            <div className="font-medium tabular-nums">{formatFrequency(cpu.currentClockMhz || cpu.maxClockMhz)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('page.monitor.cpu_max_frequency')}</div>
            <div className="font-medium tabular-nums">{formatFrequency(cpu.maxClockMhz)}</div>
          </div>
          {packageTemperature && (
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Thermometer className="h-3 w-3" />
                {t('page.monitor.cpu_temperature')}
              </div>
              <div className="font-medium tabular-nums">{packageTemperature.value.toFixed(0)}°C</div>
            </div>
          )}
          {packagePower && (
            <div>
              <div className="text-muted-foreground">{t('page.monitor.cpu_power')}</div>
              <div className="font-medium tabular-nums">{packagePower.value.toFixed(1)} W</div>
            </div>
          )}
          {cpuFan && (
            <div>
              <div className="text-muted-foreground">{t('page.monitor.cpu_fan')}</div>
              <div className="font-medium tabular-nums">{cpuFan.displayValue}</div>
            </div>
          )}
        </div>

        {/* Per-core strip: each logical processor gets an equal-height bar whose
            fill height tracks its own load. */}
        <div>
          <div className="mb-2 text-xs text-muted-foreground">{t('page.monitor.cpu_per_core')}</div>
          <div className="flex items-end gap-1">
            {cpu.coresLoad.map((load, index) => (
              <div
                key={index}
                className="group relative flex h-10 flex-1 items-end overflow-hidden rounded-sm bg-muted"
                title={`#${index + 1}: ${load.toFixed(0)}%`}
              >
                <div
                  className={`w-full rounded-sm transition-[height] duration-500 ${coreTone(load)}`}
                  style={{ height: `${Math.max(2, load)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
