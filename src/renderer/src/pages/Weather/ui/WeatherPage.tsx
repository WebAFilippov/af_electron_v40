import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { CloudSun, RefreshCw } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { $currentLocation } from '@/entities/location'
import { $weatherData, $weatherError, $weatherPending, refreshWeather } from '@/entities/weather'
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Spinner
} from '@/shared/ui'
import { cn } from '@/shared/lib'
import { SearchCard } from './SearchCard'
import { WeatherHero } from './WeatherHero'
import { HourlyStrip } from './HourlyStrip'
import { DailyForecast } from './DailyForecast'
import { WeatherDetails } from './WeatherDetails'

/**
 * Weather page.
 *
 * Layout follows the order in which the information is needed: place and the
 * current temperature first, then the next hours, then the coming days, then the
 * supporting figures. The header matches the monitoring page so the two do not
 * feel like they belong to different applications.
 */
export const WeatherPage = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather, isPending, error, handleRefresh] = useUnit([
    $currentLocation,
    $weatherData,
    $weatherPending,
    $weatherError,
    refreshWeather
  ])

  // No city yet: the search box is the whole page, because nothing else can render.
  if (!location) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.weather.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('page.weather.description')}</p>
        </div>

        <SearchCard />

        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CloudSun />
            </EmptyMedia>
            <EmptyTitle>{t('page.weather.no_location_title')}</EmptyTitle>
            <EmptyDescription>{t('page.weather.no_location_description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (isPending && !weather) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.weather.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('page.weather.description')}</p>
        </div>

        <SearchCard />

        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>{t('page.weather.fetch_title')}</EmptyTitle>
            <EmptyDescription>{t('page.weather.fetch_description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (!weather?.current) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.weather.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('page.weather.description')}</p>
        </div>

        <SearchCard />

        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CloudSun />
            </EmptyMedia>
            <EmptyTitle>{t('page.weather.fetch_retry_title')}</EmptyTitle>
            <EmptyDescription className="text-pretty">
              {/* The concrete reason is far more useful than a generic message. */}
              {error ?? t('page.weather.fetch_retry_description')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" className="gap-2" onClick={() => handleRefresh()}>
              <RefreshCw className="h-4 w-4" />
              {t('page.weather.fetch_retry')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('page.weather.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('page.weather.description')}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isPending}
          onClick={() => handleRefresh()}
        >
          <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
          {t('page.weather.refresh')}
        </Button>
      </div>

      <SearchCard />

      <WeatherHero location={location} weather={weather} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HourlyStrip hourly={weather.hourly} currentTime={weather.current.time} />
        <DailyForecast daily={weather.daily} />
      </div>

      <WeatherDetails current={weather.current} daily={weather.daily} weather={weather} />
    </div>
  )
}
