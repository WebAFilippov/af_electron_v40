import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending, refreshWeather } from '@/entities/weather'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia
} from '@/shared/ui'
import type { ReactNode } from 'react'
import { Droplet, Eye, Gauge, Map, RefreshCcw, Wind } from 'lucide-react'
import { $t } from '@/entities/i18next'
import { getWeatherDescription } from '@/entities/weather/utils'

export const WeatherWidget = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather, isPending] = useUnit([$currentLocation, $weatherData, $weatherPending])

  if (!location) {
    return (
      <Item variant="muted">
        <ItemMedia variant="icon">
          <Map />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{t('widgets.weather_widget.not_location_title')}</ItemTitle>
          <ItemDescription>{t('widgets.weather_widget.not_location_description')}</ItemDescription>
        </ItemContent>
      </Item>
    )
  }

  if (isPending) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-muted-foreground">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather?.current) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Weather data unavailable</div>
        </CardContent>
      </Card>
    )
  }

  const current = weather.current
  const description = getWeatherDescription(current.weather_code)
  const isDay = current.is_day === 1

  return (
    <Card className="w-full transition-all hover:bg-muted">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{location.city}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {location.region ? `${location.region}, ` : ''}
              {location.country}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refreshWeather()} disabled={isPending} className="h-8 w-8">
            <RefreshCcw />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{Math.round(current.temperature_2m)}°</div>
            <div>
              <p className="font-medium">{description}</p>
              <p className="text-sm text-muted-foreground">Feels like {Math.round(current.apparent_temperature)}°</p>
            </div>
          </div>

          <div className="text-5xl">{isDay ? '☀️' : '🌙'}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span>{Math.round(current.wind_speed_10m)} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-muted-foreground" />
            <span>{current.relative_humidity_2m}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>{current.cloud_cover}% cloud</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span>{Math.round(current.pressure_msl)} hPa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
