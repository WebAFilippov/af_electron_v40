import type { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { CloudSun, MapPin, RefreshCw, WifiOff } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { $currentLocation } from '@/entities/location'
import {
  $weatherData,
  $weatherFailure,
  $weatherPending,
  refreshWeather,
  type WeatherFailure
} from '@/entities/weather'
import { $detectError, $isDetectPending, detectLocationByIP } from '@/features/detect-location'
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Spinner } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { GateWeatherPage } from '../model'
import { SearchCard } from './SearchCard'
import { WeatherHero } from './WeatherHero'
import { HourlyStrip } from './HourlyStrip'
import { DailyForecast } from './DailyForecast'
import { WeatherDetails } from './WeatherDetails'

/**
 * Message for a failed fetch, phrased around what the user can do about it.
 *
 * "No network" and "the service is unreachable" look identical on screen but need
 * different advice, so the failure kind is decided in the model rather than guessed
 * from the raw error text here.
 */
const failureMessageKey = (failure: WeatherFailure): string => {
  switch (failure) {
    case 'offline':
      return 'page.weather.error_offline'
    case 'timeout':
      return 'page.weather.error_timeout'
    default:
      return 'page.weather.error_server'
  }
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

const PageEmpty = ({ icon, title, description, action }: EmptyStateProps): ReactNode => (
  <Empty className="py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">{icon}</EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription className="text-pretty">{description}</EmptyDescription>
    </EmptyHeader>
    {action && <EmptyContent>{action}</EmptyContent>}
  </Empty>
)

export const WeatherPage = (): ReactNode => {
  useGate(GateWeatherPage)

  const t = useUnit($t)
  const [location, weather, isPending, failure, detectError, isDetecting, handleRefresh, handleDetect] = useUnit([
    $currentLocation,
    $weatherData,
    $weatherPending,
    $weatherFailure,
    $detectError,
    $isDetectPending,
    refreshWeather,
    detectLocationByIP
  ])

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.weather.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.weather.description')}</p>
      </div>

      {/* The refresh button is always available: a stale forecast is the most common
          reason to visit this page, and hiding the control until data exists would
          leave the user with no way out of a failed first load. */}
      <Button variant="outline" size="sm" className="gap-2" disabled={isPending || !location} onClick={() => handleRefresh()}>
        <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
        {t('page.weather.refresh')}
      </Button>
    </div>
  )

  const content = ((): ReactNode => {
    // No city: either detection is running, or it failed and the user has to pick.
    if (!location) {
      if (isDetecting) {
        return (
          <PageEmpty
            icon={<Spinner />}
            title={t('page.weather.detecting_title')}
            description={t('page.weather.detecting_description')}
          />
        )
      }

      return (
        <PageEmpty
          icon={detectError === 'offline' ? <WifiOff /> : <MapPin />}
          title={t(detectError === 'offline' ? 'page.weather.no_city_offline_title' : 'page.weather.no_city_title')}
          description={t(
            detectError === 'offline' ? 'page.weather.no_city_offline_description' : 'page.weather.no_city_description'
          )}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="gap-2" disabled={isDetecting} onClick={() => handleDetect()}>
                <MapPin className="h-4 w-4" />
                {t('page.weather.detect_again')}
              </Button>
            </div>
          }
        />
      )
    }

    // A city is known but the first request has not finished yet.
    if (isPending && !weather) {
      return (
        <PageEmpty icon={<Spinner />} title={t('page.weather.fetch_title')} description={t('page.weather.fetch_description')} />
      )
    }

    // A city is known but no data ever arrived: show why and offer a retry.
    if (!weather?.current) {
      return (
        <PageEmpty
          icon={failure === 'offline' ? <WifiOff /> : <CloudSun />}
          title={t('page.weather.fetch_retry_title')}
          description={t(failureMessageKey(failure))}
          action={
            <Button variant="outline" className="gap-2" disabled={isPending} onClick={() => handleRefresh()}>
              <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
              {t('page.weather.fetch_retry')}
            </Button>
          }
        />
      )
    }

    return (
      <>
        {/* Stale data is still shown, with a banner: hiding it would be worse than
            showing the last known numbers. */}
        {failure !== null && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="space-y-1">
              <p className="font-medium">{t('page.weather.stale_title')}</p>
              <p className="text-muted-foreground">{t(failureMessageKey(failure))}</p>
            </div>
          </div>
        )}

        <WeatherHero location={location} weather={weather} />

        <div className="grid gap-4 lg:grid-cols-2">
          <HourlyStrip hourly={weather.hourly} currentTime={weather.current.time} />
          <DailyForecast daily={weather.daily} />
        </div>

        <WeatherDetails current={weather.current} daily={weather.daily} weather={weather} />
      </>
    )
  })()

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      {header}

      {/* The city picker stays on the page at all times: changing the city should
          never require navigating away or reloading. */}
      <SearchCard />

      {content}
    </div>
  )
}
