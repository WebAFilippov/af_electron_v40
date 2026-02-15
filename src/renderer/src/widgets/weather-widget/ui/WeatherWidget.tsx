import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending, refreshWeather } from '@/entities/weather'
import { getWeatherDescription } from '@/shared_app/api/open-meteo/types'
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
import { HugeiconsIcon } from '@hugeicons/react'
import { Droplet, Eye, GarbageTruckFreeIcons, Map, RefreshCcw, Wind } from '@hugeicons/core-free-icons'
import { $t } from '@/entities/i18next'

export const WeatherWidget = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather, isPending] = useUnit([$currentLocation, $weatherData, $weatherPending])

  if (!location) {
    return (
      <Item variant="muted">
        <ItemMedia variant="icon">
          <HugeiconsIcon icon={Map} />
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
            <CardTitle className="text-lg">{location.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {location.admin1 ? `${location.admin1}, ` : ''}
              {location.country}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refreshWeather()} disabled={isPending} className="h-8 w-8">
            <HugeiconsIcon icon={RefreshCcw} />
            {/* <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> */}
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
            <HugeiconsIcon icon={Wind} />
            {/* <Wind className="h-4 w-4 text-muted-foreground" /> */}
            <span>{Math.round(current.wind_speed_10m)} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Droplet} />
            {/* <Droplets className="h-4 w-4 text-muted-foreground" /> */}
            <span>{current.relative_humidity_2m}%</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Eye} />
            {/* <Eye className="h-4 w-4 text-muted-foreground" /> */}
            <span>{current.cloud_cover}% cloud</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={GarbageTruckFreeIcons} />
            {/* <Gauge className="h-4 w-4 text-muted-foreground" /> */}
            <span>{Math.round(current.pressure_msl)} hPa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
