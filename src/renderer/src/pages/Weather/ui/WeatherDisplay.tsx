import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending, refreshWeather } from '@/entities/weather'
import { getWeatherDescription, getWeatherIcon } from '@/shared_app/api/open-meteo/types'
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner } from '@/shared/ui'
import { RefreshCw, Wind, Droplets, Eye, Gauge, CloudRain, Sunrise, Sunset, Thermometer, Calendar } from 'lucide-react'
import type { ReactNode } from 'react'
import { getWindDirection } from '../utils/getWindDirection'
import { formatTime } from '../utils/formatTime'
import { $t } from '@/entities/i18next'
import { cn } from '@/shared/lib'

// Компонент детали погоды
const WeatherDetail = ({
  icon: Icon,
  label,
  value,
  subValue,
  className
}: {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  className?: string
}): ReactNode => (
  <div
    className={cn(
      'flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border',
      className
    )}
  >
    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm">
      <Icon className="w-6 h-6 text-muted-foreground" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
  </div>
)

// Карточка прогноза на день
const ForecastDay = ({
  date,
  icon,
  description,
  maxTemp,
  minTemp,
  isToday
}: {
  date: string
  icon: string
  description: string
  maxTemp: number
  minTemp: number
  isToday?: boolean
}): ReactNode => (
  <div
    className={cn(
      'flex items-center justify-between p-4 rounded-2xl transition-colors',
      isToday ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'hover:bg-muted/50'
    )}
  >
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{isToday ? 'Сегодня' : date}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xl font-bold">{Math.round(maxTemp)}°</p>
      <p className="text-sm text-muted-foreground">{Math.round(minTemp)}°</p>
    </div>
  </div>
)

export const WeatherDisplay = (): ReactNode => {
  const t = useUnit($t)
  const location = useUnit($currentLocation)
  const weather = useUnit($weatherData)
  const isPending = useUnit($weatherPending)

  if (!weather?.current || !location) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Spinner className="w-12 h-12 mx-auto" />
          <p className="text-muted-foreground">{t('page.weather.loading', 'Загрузка погоды...')}</p>
        </div>
      </div>
    )
  }

  const current = weather.current
  const daily = weather.daily
  const isDay = current.is_day === 1

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Главная карточка погоды */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Основная информация */}
        <Card
          className={cn(
            'lg:col-span-2 overflow-hidden',
            isDay
              ? 'bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 text-white border-0'
              : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white border-0'
          )}
        >
          <CardContent className="p-8">
            {/* Шапка */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">{location.name}</h2>
                <p className="text-white/80 mt-1">
                  {location.admin1 ? `${location.admin1}, ` : ''}
                  {location.country}
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Обновлено:{' '}
                  {new Date(current.time).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refreshWeather()}
                disabled={isPending}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={cn('w-5 h-5', isPending && 'animate-spin')} />
              </Button>
            </div>

            {/* Температура */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-8xl font-bold tracking-tighter">{Math.round(current.temperature_2m)}°</div>
                <div className="space-y-2">
                  <p className="text-2xl font-medium">{getWeatherDescription(current.weather_code)}</p>
                  <p className="text-white/80">Ощущается как {Math.round(current.apparent_temperature)}°</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4" />
                      Макс: {daily ? Math.round(daily.temperature_2m_max[0]) : '--'}°
                    </span>
                    <span className="flex items-center gap-1">
                      Мин: {daily ? Math.round(daily.temperature_2m_min[0]) : '--'}°
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-9xl opacity-90">{getWeatherIcon(current.weather_code)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Солнце и луна */}
        {daily && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Calendar className="w-5 h-5" />
                Солнце и Луна
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Sunrise className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Восход</p>
                  <p className="text-xl font-bold">{formatTime(daily.sunrise[0])}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Sunset className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Закат</p>
                  <p className="text-xl font-bold">{formatTime(daily.sunset[0])}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Детали погоды */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WeatherDetail
          icon={Wind}
          label="Ветер"
          value={`${Math.round(current.wind_speed_10m)} км/ч`}
          subValue={getWindDirection(current.wind_direction_10m)}
        />
        <WeatherDetail
          icon={Droplets}
          label="Влажность"
          value={`${current.relative_humidity_2m}%`}
          subValue={current.relative_humidity_2m > 60 ? 'Высокая' : 'Нормальная'}
        />
        <WeatherDetail icon={Eye} label="Облачность" value={`${current.cloud_cover}%`} />
        <WeatherDetail icon={Gauge} label="Давление" value={`${Math.round(current.pressure_msl)}`} subValue="гПа" />
      </div>

      {/* Осадки */}
      {(current.precipitation > 0 || current.rain > 0 || current.snowfall > 0) && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
                <CloudRain className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Осадки</p>
                <p className="text-xl font-bold">
                  {current.precipitation > 0 && `${current.precipitation} мм `}
                  {current.rain > 0 && `дождь `}
                  {current.snowfall > 0 && `${current.snowfall} см снега`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Прогноз на 7 дней */}
      {daily && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Прогноз на 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {daily.time.slice(0, 7).map((time, index) => (
              <ForecastDay
                key={time}
                date={
                  index === 0
                    ? 'Сегодня'
                    : new Date(time).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short'
                      })
                }
                icon={getWeatherIcon(daily.weather_code[index])}
                description={getWeatherDescription(daily.weather_code[index])}
                maxTemp={daily.temperature_2m_max[index]}
                minTemp={daily.temperature_2m_min[index]}
                isToday={index === 0}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
