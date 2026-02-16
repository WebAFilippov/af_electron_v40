import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending, refreshWeather } from '@/entities/weather'
import { CitySearch } from '@/features/search-location/ui/CitySearch'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Spinner,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/shared/ui'
import { RefreshCw, Wind, Droplets, Eye, Gauge, CloudRain, Sunrise, Sunset } from 'lucide-react'
import type { ReactNode } from 'react'
import { getWindDirection } from '../utils/getWindDirection'
import { formatTime } from '../utils/formatTime'
import { HugeiconsIcon } from '@hugeicons/react'
import { FirewallIcon, Map, Refresh01Icon } from '@hugeicons/core-free-icons'
import { $t } from '@/entities/i18next'
import { HourlyTemperatureChart } from './HourlyTemperatureChart'
import { DetectLocation } from '@/features/detect-location/ui/DetectCity'
import { getWeatherDescription } from '@/entities/weather/utils'

export const WeatherPage = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather, isPending] = useUnit([$currentLocation, $weatherData, $weatherPending])

  if (!location) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HugeiconsIcon icon={Map} />
            {t('page.weather.not_location_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CitySearch />

          <p className="text-muted-foreground text-center">{t('page.weather.not_location_or')}</p>

          <DetectLocation className="w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isPending && !weather) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>{t('page.weather.fetch_title')}</EmptyTitle>
          <EmptyDescription>
            <EmptyContent>{t('page.weather.fetch_description')}</EmptyContent>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!weather?.current) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FirewallIcon} />
          </EmptyMedia>
          <EmptyTitle> {t('page.weather.fetch_retry_title')}</EmptyTitle>
          <EmptyDescription className="text-pretty">{t('page.weather.fetch_retry_description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refreshWeather()}>
            <HugeiconsIcon icon={Refresh01Icon} />
            {t('page.weather.fetch_retry')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const current = weather.current
  const daily = weather.daily
  const isDay = current.is_day === 1

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <CitySearch />
              </div>
              <DetectLocation />
            </div>
          </CardContent>
        </Card>

        {/* Current Weather */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{location.city}</CardTitle>
                <p className="text-muted-foreground">
                  {location.region ? `${location.region}, ` : ''}
                  {location.country}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('page.weather.updated')} {new Date(current.time).toLocaleTimeString()}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => refreshWeather()} disabled={isPending}>
                <RefreshCw className={`h-5 w-5 ${isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold">{Math.round(current.temperature_2m)}°</div>
                <div>
                  <p className="text-xl font-medium">{getWeatherDescription(current.weather_code)}</p>
                  <p className="text-muted-foreground">
                    {t('page.weather.feels_like')} {Math.round(current.apparent_temperature)}°
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {t('page.weather.high')}: {daily ? Math.round(daily.temperature_2m_max[0]) : '--'}°
                    </span>
                    <span>
                      {t('page.weather.low')}: {daily ? Math.round(daily.temperature_2m_min[0]) : '--'}°
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-7xl">{isDay ? '☀️' : '🌙'}</div>
            </div>

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Wind className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('page.weather.wind')}</p>
                  <p className="font-medium">
                    {t('page.weather.values.wind', {
                      value: Math.round(current.wind_speed_10m),
                      direction: getWindDirection(current.wind_direction_10m)
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Droplets className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('page.weather.humidity')}</p>
                  <p className="font-medium">
                    {t('page.weather.values.humidity', { value: current.relative_humidity_2m })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('page.weather.cloud_cover')}</p>
                  <p className="font-medium">{t('page.weather.values.cloud_cover', { value: current.cloud_cover })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('page.weather.pressure')}</p>
                  <p className="font-medium">
                    {t('page.weather.values.pressure', { value: Math.round(current.pressure_msl) })}
                  </p>
                </div>
              </div>
            </div>

            {/* Precipitation */}
            {(current.precipitation > 0 || current.rain > 0 || current.snowfall > 0) && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <CloudRain className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t('page.weather.precipitation')}</p>
                  <p className="font-medium">
                    {current.precipitation > 0 &&
                      t('page.weather.values.precipitation', { value: current.precipitation }) + ' '}
                    {current.rain > 0 && t('page.weather.rain') + ' '}
                    {current.snowfall > 0 && t('page.weather.snow')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Temperature Chart */}
        {weather.hourly && <HourlyTemperatureChart hourly={weather.hourly} />}

        {/* Sun Times */}
        {daily && (
          <Card>
            <CardHeader>
              <CardTitle>{t('page.weather.sun_moon')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Sunrise className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('page.weather.sunrise')}</p>
                    <p className="font-medium">{formatTime(daily.sunrise[0])}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sunset className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('page.weather.sunset')}</p>
                    <p className="font-medium">{formatTime(daily.sunset[0])}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
