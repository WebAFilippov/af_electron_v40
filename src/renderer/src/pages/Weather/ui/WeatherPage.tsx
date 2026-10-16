import { lazy, Suspense } from 'react'
import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending } from '@/entities/weather'
import {

  Button,
  Spinner,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/shared/ui'
import { RefreshCw, ShieldOff } from 'lucide-react'
import { $t } from '@/entities/i18next'
import { SearchCard } from './SearchCard'
import { WeatherSkeleton } from './WeatherSkeleton'
import { refreshWeather } from '@/entities/weather'
import type { ReactNode } from 'react'

// Lazy-loaded components
const CurrentWeather = lazy(() => import('./CurrentWeather').then((m) => ({ default: m.CurrentWeather })))
const WeatherDetails = lazy(() => import('./WeatherDetails').then((m) => ({ default: m.WeatherDetails })))
const PrecipitationCard = lazy(() => import('./PrecipitationCard').then((m) => ({ default: m.PrecipitationCard })))
const SunTimesCard = lazy(() => import('./SunTimesCard').then((m) => ({ default: m.SunTimesCard })))
const HourlyTemperatureChart = lazy(() =>
  import('./HourlyTemperatureChart').then((m) => ({ default: m.HourlyTemperatureChart }))
)

export const WeatherPage = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather, isPending] = useUnit([$currentLocation, $weatherData, $weatherPending])

  // Нет локации - показываем поиск
  if (!location) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <SearchCard />
        </div>
      </div>
    )
  }

  // Загрузка данных
  if (isPending && !weather) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <SearchCard />
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
        </div>
      </div>
    )
  }

  // Ошибка загрузки
  if (!weather?.current) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <SearchCard />
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldOff />
              </EmptyMedia>
              <EmptyTitle>{t('page.weather.fetch_retry_title')}</EmptyTitle>
              <EmptyDescription className="text-pretty">{t('page.weather.fetch_retry_description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => refreshWeather()}>
                <RefreshCw />
                {t('page.weather.fetch_retry')}
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    )
  }

  const current = weather.current
  const daily = weather.daily

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <SearchCard />

        {/* Lazy-loaded content with Suspense */}
        <Suspense fallback={<WeatherSkeleton />}>
          <CurrentWeather location={location} current={current} daily={daily} />
          <WeatherDetails current={current} />
          <PrecipitationCard current={current} />
          {daily && <SunTimesCard daily={daily} />}
          {weather.hourly && <HourlyTemperatureChart hourly={weather.hourly} />}
        </Suspense>
      </div>
    </div>
  )
}
