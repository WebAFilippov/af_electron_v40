import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useUnit } from 'effector-react'
import { Droplets } from 'lucide-react'

import { $t } from '@/entities/i18next'
import type { WeatherHourly } from '@/shared_app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { WeatherIcon } from '@/entities/weather/ui/weather-icon'

interface HourlyStripProps {
  hourly: WeatherHourly
  /** ISO string of the observation time, used to start the strip at "now". */
  currentTime: string
}

/**
 * Short-term outlook as a scrolling strip.
 *
 * A strip rather than a line chart: on a multi-hour chart the temperature
 * difference between neighbouring points is a few pixels, so the trend is hard to
 * read while each point's icon and rain chance are lost entirely.
 *
 * The provider supplies points every three hours, so the title says "next hours"
 * without promising an entry for every single hour.
 */
export const HourlyStrip = ({ hourly, currentTime }: HourlyStripProps): ReactNode => {
  const t = useUnit($t)

  const hours = useMemo(() => {
    // The provider returns points on a fixed grid starting at midnight, so the
    // part of the day that has already passed is skipped.
    //
    // The comparison uses the hour only: `currentTime` carries minutes, so a point
    // at 15:00 must still match an observation at 15:47.
    const currentHour = currentTime.slice(0, 13)
    const found = hourly.time.findIndex((time) => time.slice(0, 13) >= currentHour)
    const from = found === -1 ? 0 : found

    return hourly.time.slice(from, from + 24).map((time, offset) => {
      const index = from + offset
      return {
        time,
        hour: time.slice(11, 16),
        temperature: Math.round(hourly.temperature[index]),
        feelsLike: Math.round(hourly.feelsLike[index]),
        code: hourly.code[index],
        precipitation: hourly.precipitationProbability[index] ?? 0,
        // Only mark "now" when the grid actually lands on the current hour;
        // otherwise the label would claim the present for a point hours ahead.
        isNow: offset === 0 && time.slice(11, 13) === currentTime.slice(11, 13)
      }
    })
  }, [hourly, currentTime])

  // Day/night per point, derived from the hour itself: the payload carries a single
  // `isDay` for the current observation, not one per forecast hour.
  const isNightHour = (time: string): boolean => {
    const hour = Number.parseInt(time.slice(11, 13), 10)
    return hour < 6 || hour >= 21
  }

  const temps = hours.map((hour) => hour.temperature)
  const coldest = Math.min(...temps)
  const warmest = Math.max(...temps)
  const span = Math.max(1, warmest - coldest)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">{t('page.weather.hourly_title')}</CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground">
            {coldest}° … {warmest}°
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="scroll-area flex gap-2 overflow-x-auto px-6 pb-2">
          {hours.map((hour) => {
            // Bar height is relative to the strip's own range, so the shape shows the
            // trend even when the whole day varies by only a couple of degrees.
            const height = 24 + ((hour.temperature - coldest) / span) * 32

            return (
              <div
                key={hour.time}
                className={cn(
                  'flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors',
                  hour.isNow ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/60'
                )}
              >
                <span
                  className={cn(
                    'text-xs font-medium tabular-nums',
                    hour.isNow ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {hour.isNow ? t('page.weather.now') : hour.hour}
                </span>

                <WeatherIcon code={hour.code} isDay={isNightHour(hour.time) ? 0 : 1} className="h-7 w-7" />

                <span className="text-base font-semibold tabular-nums">{hour.temperature}°</span>

                {/* The bar turns absolute numbers into a shape the eye can follow. */}
                <div className="flex h-14 w-full items-end justify-center">
                  <div
                    className="w-6 rounded-t-md bg-gradient-to-t from-sky-500/70 to-sky-400 transition-[height] duration-500"
                    style={{ height: `${height}px` }}
                  />
                </div>

                <span className="text-[10px] tabular-nums text-muted-foreground">{hour.feelsLike}°</span>

                <span
                  className={cn(
                    'flex items-center gap-0.5 text-[10px] tabular-nums',
                    hour.precipitation >= 30 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground/60'
                  )}
                >
                  <Droplets className="h-2.5 w-2.5" />
                  {hour.precipitation}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
