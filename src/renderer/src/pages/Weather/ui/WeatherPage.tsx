import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending, refreshWeather } from '@/entities/weather'
import { CitySearch } from '@/features/search-location/ui/CitySearch'
import { detectLocationByIP, $ipDetectionPending } from '@/features/detect-location/model/detect-location'
import { getWeatherDescription, getWeatherIcon } from '@/shared_app/api/open-meteo/types'
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
import { RefreshCw, MapPin, Wind, Droplets, Eye, Gauge, CloudRain, Sunrise, Sunset } from 'lucide-react'
import type { ReactNode } from 'react'
import { getWindDirection } from '../utils/getWindDirection'
import { formatTime } from '../utils/formatTime'
import { HugeiconsIcon } from '@hugeicons/react'
import { FirewallIcon, Map, MapPinPlus, Refresh01Icon } from '@hugeicons/core-free-icons'
import { $t } from '@/entities/i18next'

export const WeatherPage = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather, isPending, isDetecting] = useUnit([
    $currentLocation,
    $weatherData,
    $weatherPending,
    $ipDetectionPending
  ])

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

          <Button
            onClick={() => detectLocationByIP()}
            disabled={isDetecting}
            className="w-full cursor-pointer h-10"
            variant="outline"
            size="lg"
          >
            {isDetecting ? (
              <>
                <Spinner />
                {t('page.weather.not_location_detecting')}
              </>
            ) : (
              <>
                <HugeiconsIcon icon={MapPinPlus} />
                {t('page.weather.not_location_detect')}
              </>
            )}
          </Button>
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
              <Button variant="outline" onClick={() => detectLocationByIP()} disabled={isDetecting}>
                <MapPin className="mr-2 h-4 w-4" />
                Detect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Weather */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{location.name}</CardTitle>
                <p className="text-muted-foreground">
                  {location.admin1 ? `${location.admin1}, ` : ''}
                  {location.country}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Updated: {new Date(current.time).toLocaleTimeString()}
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
                  <p className="text-muted-foreground">Feels like {Math.round(current.apparent_temperature)}°</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>H: {daily ? Math.round(daily.temperature_2m_max[0]) : '--'}°</span>
                    <span>L: {daily ? Math.round(daily.temperature_2m_min[0]) : '--'}°</span>
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
                  <p className="text-sm text-muted-foreground">Wind</p>
                  <p className="font-medium">
                    {Math.round(current.wind_speed_10m)} km/h {getWindDirection(current.wind_direction_10m)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Droplets className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="font-medium">{current.relative_humidity_2m}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cloud Cover</p>
                  <p className="font-medium">{current.cloud_cover}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Pressure</p>
                  <p className="font-medium">{Math.round(current.pressure_msl)} hPa</p>
                </div>
              </div>
            </div>

            {/* Precipitation */}
            {(current.precipitation > 0 || current.rain > 0 || current.snowfall > 0) && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                <CloudRain className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Precipitation</p>
                  <p className="font-medium">
                    {current.precipitation > 0 && `${current.precipitation}mm `}
                    {current.rain > 0 && `rain `}
                    {current.snowfall > 0 && `${current.snowfall}cm snow`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Forecast */}
        {daily && (
          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {daily.time.slice(0, 7).map((time, index) => (
                  <div key={time} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 w-24">
                      <span className="text-sm font-medium">
                        {index === 0 ? 'Today' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{getWeatherIcon(daily.weather_code[index])}</span>
                      <span className="text-sm text-muted-foreground">
                        {getWeatherDescription(daily.weather_code[index])}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">{Math.round(daily.temperature_2m_max[index])}°</span>
                      <span className="text-muted-foreground">{Math.round(daily.temperature_2m_min[index])}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sun Times */}
        {daily && (
          <Card>
            <CardHeader>
              <CardTitle>Sun & Moon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Sunrise className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sunrise</p>
                    <p className="font-medium">{formatTime(daily.sunrise[0])}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sunset className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sunset</p>
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
