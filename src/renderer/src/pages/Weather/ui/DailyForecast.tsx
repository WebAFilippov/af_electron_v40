import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useUnit } from 'effector-react'
import { Droplets } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { getWeatherDescription } from '@/entities/weather'
import { WeatherIcon } from '@/entities/weather/ui/weather-icon'
import type { WeatherDaily } from '@/shared_app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { cn } from '@/shared/lib'

interface DailyForecastProps {
  daily: WeatherDaily
}

/**
 * Multi-day outlook.
 *
 * Each day draws its temperature band on one shared scale for the whole period, so
 * a warm day sits visibly to the right of a cold one. Absolute numbers alone do not
 * make that comparison easy, which is why the bar exists at all.
 */
export const DailyForecast = ({ daily }: DailyForecastProps): ReactNode => {
  const t = useUnit($t)

  const days = useMemo(() => {
    // The period's span drives the bar geometry, so every day shares one scale.
    const allMin = Math.min(...daily.temperatureMin)
    const allMax = Math.max(...daily.temperatureMax)
    const span = Math.max(1, allMax - allMin)

    return daily.time.map((date, index) => ({
      date,
      code: daily.codes[index],
      min: daily.temperatureMin[index],
      max: daily.temperatureMax[index],
      precipitation: daily.precipitationProbabilityMax[index] ?? 0,
      left: ((daily.temperatureMin[index] - allMin) / span) * 100,
      width: Math.max(6, ((daily.temperatureMax[index] - daily.temperatureMin[index]) / span) * 100)
    }))
  }, [daily])

  const dayLabel = (date: string, index: number): string => {
    if (index === 0) return t('page.weather.today')
    // Parsing as a local date avoids the off-by-one that `new Date('2026-10-18')`
    // produces by treating the string as UTC.
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: 'short' })
  }

  const dateLabel = (date: string): string => {
    const [, month, day] = date.split('-').map(Number)
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('page.weather.daily_title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {days.map((day, index) => (
          <div
            key={day.date}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
              index === 0 ? 'bg-muted/50' : 'hover:bg-muted/40'
            )}
          >
            <div className="w-16 shrink-0">
              <div className={cn('text-sm capitalize', index === 0 ? 'font-semibold' : 'font-medium')}>
                {dayLabel(day.date, index)}
              </div>
              <div className="text-[10px] tabular-nums text-muted-foreground">{dateLabel(day.date)}</div>
            </div>

            <WeatherIcon code={day.code} isDay={1} className="h-5 w-5 shrink-0" />

            {/* The description is why the row is readable at all: the icon is
                ambiguous between the many "partly cloudy" variants. */}
            <span
              className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
              title={getWeatherDescription(day.code)}
            >
              {getWeatherDescription(day.code)}
            </span>

            <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">{Math.round(day.min)}°</span>

            <div className="relative h-1.5 w-16 shrink-0 rounded-full bg-muted">
              <div
                className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-500 via-amber-400 to-orange-500"
                style={{ left: `${day.left}%`, width: `${day.width}%` }}
              />
            </div>

            <span className="w-8 shrink-0 text-right font-medium tabular-nums">{Math.round(day.max)}°</span>

            {/* Precipitation chance only earns emphasis when it is meaningful. */}
            <span
              className={cn(
                'flex w-10 shrink-0 items-center justify-end gap-0.5 text-xs tabular-nums',
                day.precipitation >= 30 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground/50'
              )}
            >
              <Droplets className="h-2.5 w-2.5" />
              {day.precipitation}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
