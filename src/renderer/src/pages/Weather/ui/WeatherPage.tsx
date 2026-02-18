import { lazy, Suspense } from 'react'
import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherPending } from '@/entities/weather'
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
import { HugeiconsIcon } from '@hugeicons/react'
import { FirewallIcon, Map, Refresh01Icon } from '@hugeicons/core-free-icons'
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
          <Card className="w-full max-w-4xl mx-auto mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <HugeiconsIcon icon={Map} />
                {t('page.weather.not_location_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-center">{t('page.weather.not_location_or')}</p>
            </CardContent>
          </Card>
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
                <HugeiconsIcon icon={FirewallIcon} />
              </EmptyMedia>
              <EmptyTitle>{t('page.weather.fetch_retry_title')}</EmptyTitle>
              <EmptyDescription className="text-pretty">{t('page.weather.fetch_retry_description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => refreshWeather()}>
                <HugeiconsIcon icon={Refresh01Icon} />
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
        {/* Search Card - всегда наверху */}
        <SearchCard />

        {/* Lazy-loaded content with Suspense */}
        <Suspense fallback={<WeatherSkeleton />}>
          <CurrentWeather location={location} current={current} daily={daily} />
          <WeatherDetails current={current} />
          <PrecipitationCard current={current} />
          {weather.hourly && <HourlyTemperatureChart hourly={weather.hourly} />}
          {daily && <SunTimesCard daily={daily} />}
        </Suspense>
      </div>
    </div>
  )
}
