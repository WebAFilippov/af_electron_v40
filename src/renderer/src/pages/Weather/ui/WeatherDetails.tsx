import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Cloud, Sunrise, Sunset, Wind } from 'lucide-react'

import { $t } from '@/entities/i18next'
import type { WeatherCurrent, WeatherDaily, WeatherData } from '@/shared_app/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

interface WeatherDetailsProps {
  current: WeatherCurrent
  daily: WeatherDaily
  weather: WeatherData
}

/** Compass point for a wind direction in degrees. */
const compassPoint = (degrees: number): string => {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return points[Math.round(degrees / 45) % 8]
}

/** Extracts "HH:MM" from an ISO timestamp without a timezone shift. */
const clockTime = (iso: string): string => iso.slice(11, 16)

/** Minutes since midnight, used by the daylight maths. */
const toMinutes = (iso: string): number =>
  Number.parseInt(iso.slice(11, 13), 10) * 60 + Number.parseInt(iso.slice(14, 16), 10)

interface DaylightCardProps {
  sunrise: string
  sunset: string
  currentTime: string
}

/**
 * Sun times with progress through the daylight period.
 *
 * People rarely ask "when is sunset" — they ask "how much light is left", which the
 * bar answers without any arithmetic on their side.
 */
const DaylightCard = ({ sunrise, sunset, currentTime }: DaylightCardProps): ReactNode => {
  const t = useUnit($t)

  const start = toMinutes(sunrise)
  const end = toMinutes(sunset)
  const now = toMinutes(currentTime)

  const total = Math.max(1, end - start)
  const elapsed = Math.min(total, Math.max(0, now - start))
  const percent = (elapsed / total) * 100

  const isDaylight = now >= start && now < end
  const hoursLeft = Math.max(0, Math.round((end - Math.max(now, start)) / 60))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('page.weather.sun_title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <Sunrise className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t('page.weather.sunrise')}</div>
              <div className="text-xl font-semibold tabular-nums">{clockTime(sunrise)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
              <Sunset className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t('page.weather.sunset')}</div>
              <div className="text-xl font-semibold tabular-nums">{clockTime(sunset)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {isDaylight
              ? t('page.weather.daylight_left').replace('{hours}', String(hoursLeft))
              : t('page.weather.dark_now')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Wind detail and sun times.
 *
 * Temperature, humidity, pressure and precipitation live in the hero and are
 * deliberately not repeated here — this card adds what the hero has no room for:
 * gusts, exact direction with a compass, cloud cover, and daylight.
 */
export const WeatherDetails = ({ current, daily, weather }: WeatherDetailsProps): ReactNode => {
  const t = useUnit($t)

  const sunrise = daily.sunrise[0]
  const sunset = daily.sunset[0]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('page.weather.wind_title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">{t('page.weather.wind')}</div>
              <div className="text-3xl font-semibold tabular-nums">
                {Math.round(current.windSpeed)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{weather.units.windSpeed}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">{t('page.weather.direction')}</div>
              <div className="text-lg font-semibold">
                {compassPoint(current.windDirection)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {Math.round(current.windDirection)}°
                </span>
              </div>
            </div>
          </div>

          {/* A compass makes the direction readable at a glance; the letters alone
              require knowing the order of the compass points. */}
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-border" />
            <div className="absolute inset-3 rounded-full border border-border/60" />
            <span className="absolute top-0 text-[10px] text-muted-foreground">N</span>
            <span className="absolute bottom-0 text-[10px] text-muted-foreground">S</span>
            <span className="absolute left-0 text-[10px] text-muted-foreground">W</span>
            <span className="absolute right-0 text-[10px] text-muted-foreground">E</span>
            <div
              className="origin-center transition-transform duration-700"
              style={{ transform: `rotate(${(current.windDirection + 180) % 360}deg)` }}
            >
              <Wind className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wind className="h-3 w-3" />
                {t('page.weather.gusts')}
              </div>
              <div className="font-semibold tabular-nums">
                {Math.round(current.windGusts)} {weather.units.windSpeed}
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Cloud className="h-3 w-3" />
                {t('page.weather.clouds')}
              </div>
              <div className="font-semibold tabular-nums">{current.cloudCover}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sunrise && sunset ? (
        <DaylightCard sunrise={sunrise} sunset={sunset} currentTime={current.time} />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('page.weather.sun_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('page.weather.sun_unavailable')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
