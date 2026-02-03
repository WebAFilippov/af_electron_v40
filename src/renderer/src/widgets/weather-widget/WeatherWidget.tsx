import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending, refreshWeather } from '@/entities/weather'
import { getWeatherDescription } from '@/shared_app/api/open-meteo/types'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/shared/ui'
import { RefreshCw, MapPin, Wind, Droplets, Eye, Gauge } from 'lucide-react'
import type { ReactNode } from 'react'

export const WeatherWidget = (): ReactNode => {
  const [location, weather, isPending] = useUnit([$currentLocation, $weatherData, $weatherPending])

  if (!location) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>No location selected</span>
          </div>
        </CardContent>
      </Card>
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
    <Card className="w-full">
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
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
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
            <Droplets className="h-4 w-4 text-muted-foreground" />
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
