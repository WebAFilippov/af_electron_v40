import { Card, CardContent, CardHeader, CardTitle, Button } from '@/shared/ui'
import { RefreshCw } from 'lucide-react'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'
import { $weatherPending, refreshWeather } from '@/entities/weather'
import { getWeatherDescription } from '@/entities/weather/utils'
import type { CurrentWeather as CurrentWeatherType, DailyWeather } from '@/entities/weather/model/types'
import type { Location } from '@/shared_app/types'
import type { ReactNode } from 'react'

interface CurrentWeatherProps {
  location: Location
  current: CurrentWeatherType
  daily: DailyWeather | undefined
}

export const CurrentWeather = ({ location, current, daily }: CurrentWeatherProps): ReactNode => {
  const t = useUnit($t)
  const isPending = useUnit($weatherPending)
  const isDay = current.is_day === 1

  return (
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
      </CardContent>
    </Card>
  )
}
