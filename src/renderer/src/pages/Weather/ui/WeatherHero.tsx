import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { ArrowDown, ArrowUp, Clock, Droplets, Gauge, RefreshCw, Sun, Wind } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { $weatherPending, getWeatherDescription, refreshWeather } from '@/entities/weather'
import { WeatherIcon } from '@/entities/weather/ui/weather-icon'
import type { Location, WeatherCurrent, WeatherDaily, WeatherData } from '@/shared_app/types'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib'

interface HeroProps {
  location: Location
  weather: WeatherData
}

/**
 * Background gradient by air temperature.
 *
 * Colour is the fastest way to read "how cold is it" — faster than parsing a
 * number. The tones stay dark so white text keeps its contrast in both themes.
 */
const toneForTemperature = (celsius: number): string => {
  if (celsius <= -15) return 'from-sky-950 via-indigo-900 to-slate-900'
  if (celsius <= -5) return 'from-sky-900 via-blue-800 to-indigo-950'
  if (celsius <= 5) return 'from-sky-800 via-cyan-800 to-blue-900'
  if (celsius <= 15) return 'from-teal-800 via-cyan-700 to-emerald-900'
  if (celsius <= 25) return 'from-emerald-800 via-teal-700 to-cyan-800'
  if (celsius <= 32) return 'from-amber-800 via-orange-700 to-red-900'
  return 'from-red-900 via-orange-800 to-amber-800'
}

/** Points the wind arrow where the air goes, not where it comes from. */
const windRotation = (direction: number): number => (direction + 180) % 360

/** Compass point for a wind direction in degrees. */
const compassPoint = (degrees: number): string => {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return points[Math.round(degrees / 45) % 8]
}

interface HeroMetricProps {
  icon: ReactNode
  label: string
  value: string
  /** Secondary line; a node rather than a string so the wind arrow can rotate. */
  hint?: ReactNode
}

/** One figure in the hero's bottom strip. */
const HeroMetric = ({ icon, label, value, hint }: HeroMetricProps): ReactNode => (
  <div className="flex min-w-24 flex-col gap-1">
    <span className="flex items-center gap-1.5 text-xs text-white/60">
      {icon}
      {label}
    </span>
    <span className="text-base font-semibold tabular-nums text-white">{value}</span>
    {hint && <span className="text-[11px] text-white/50">{hint}</span>}
  </div>
)

export const WeatherHero = ({ location, weather }: HeroProps): ReactNode => {
  const t = useUnit($t)
  const [isPending, handleRefresh] = useUnit([$weatherPending, refreshWeather])

  const current: WeatherCurrent = weather.current
  const daily: WeatherDaily = weather.daily

  const high = daily.temperatureMax[0]
  const low = daily.temperatureMin[0]

  // The observation time is the honest "as of" stamp; the fetch time would suggest
  // the numbers are fresher than the upstream model actually is.
  const updated = current.time.slice(11, 16)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg',
        toneForTemperature(current.temperature)
      )}
    >
      {/* Soft light sources so the flat gradient does not look dead. */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-black/20 blur-3xl" />

      {/* Header: place on the left, freshness on the right. */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold leading-tight">{location.city}</h2>
          <p className="text-sm text-white/60">
            {location.region ? `${location.region}, ` : ''}
            {location.country}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
          disabled={isPending}
          onClick={() => handleRefresh()}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isPending && 'animate-spin')} />
          <Clock className="h-3.5 w-3.5" />
          {updated}
        </Button>
      </div>

      {/* Main reading: the number dominates, everything else supports it. */}
      <div className="relative mt-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <span className="text-8xl font-semibold leading-none tracking-tighter tabular-nums">
            {Math.round(current.temperature)}
            <span className="align-top text-4xl font-normal text-white/60">°</span>
          </span>

          <div className="space-y-1.5">
            <p className="text-xl font-medium">{getWeatherDescription(current.code)}</p>
            <p className="flex items-center gap-1.5 text-sm text-white/70">
              <Sun className="h-3.5 w-3.5" />
              {t('page.weather.feels_like')} {Math.round(current.feelsLike)}°
            </p>
            <div className="flex items-center gap-4 pt-1 text-sm text-white/80">
              <span className="flex items-center gap-1 tabular-nums">
                <ArrowUp className="h-3.5 w-3.5 text-rose-300" />
                {Math.round(high)}°
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <ArrowDown className="h-3.5 w-3.5 text-sky-300" />
                {Math.round(low)}°
              </span>
            </div>
          </div>
        </div>

        <WeatherIcon code={current.code} isDay={current.isDay} className="h-28 w-28 text-white/85 drop-shadow-lg" />
      </div>

      {/* Supporting figures in one row: what people check after the temperature. */}
      <div className="relative mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-4">
        <HeroMetric
          icon={<Wind className="h-3.5 w-3.5" />}
          label={t('page.weather.wind')}
          value={`${Math.round(current.windSpeed)} ${weather.units.windSpeed}`}
          hint={
            <>
              <span
                className="mr-1 inline-block"
                style={{ transform: `rotate(${windRotation(current.windDirection)}deg)` }}
                aria-hidden
              >
                ↑
              </span>
              {compassPoint(current.windDirection)}
            </>
          }
        />

        <HeroMetric
          icon={<Droplets className="h-3.5 w-3.5" />}
          label={t('page.weather.humidity')}
          value={`${current.humidity}%`}
        />

        <HeroMetric
          icon={<Gauge className="h-3.5 w-3.5" />}
          label={t('page.weather.pressure')}
          value={`${Math.round(current.pressure)}`}
          hint={weather.units.pressure}
        />

        <HeroMetric
          icon={<Droplets className="h-3.5 w-3.5" />}
          label={t('page.weather.precipitation')}
          value={`${current.precipitation} ${weather.units.precipitation}`}
        />
      </div>
    </div>
  )
}
