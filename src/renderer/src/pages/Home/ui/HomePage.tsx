import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useUnit } from 'effector-react'
import { Activity, CloudSun, PackageCheck, Settings } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { $currentLocation } from '@/entities/location'
import { $weatherData } from '@/entities/weather'
import { getWeatherDescription } from '@/entities/weather'
import { WeatherIcon } from '@/entities/weather/ui/weather-icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

export const HomePage = (): ReactNode => {
  const t = useUnit($t)
  const [location, weather] = useUnit([$currentLocation, $weatherData])

  const current = weather?.current

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.home.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.home.description')}</p>
      </div>

      {/* The weather summary is a live card rather than a link with a title: the
          point of the first screen is to answer "what is going on" immediately. */}
      <Link to="/weather" className="block">
        <Card className="group cursor-pointer transition-colors hover:border-primary/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CloudSun size={20} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('page.home.weather')}</CardTitle>
                  <CardDescription>
                    {location ? `${location.city}, ${location.country}` : t('page.home.weather_no_city')}
                  </CardDescription>
                </div>
              </div>

              {current && (
                <div className="flex items-center gap-3">
                  <WeatherIcon code={current.code} isDay={current.isDay} className="h-8 w-8 text-primary/70" />
                  <div className="text-right">
                    <div className="text-2xl font-semibold tabular-nums leading-none">
                      {Math.round(current.temperature)}°
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {getWeatherDescription(current.code)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              {location ? t('page.home.weather_open') : t('page.home.weather_pick_city')}
            </p>
          </CardContent>
        </Card>
      </Link>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/monitor" className="block">
          <Card className="h-full cursor-pointer transition-colors hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity size={20} className="text-primary" />
              </div>
              <CardTitle className="mt-3 text-base">{t('page.home.monitor_title')}</CardTitle>
              <CardDescription>{t('page.home.monitor_description')}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/update" className="block">
          <Card className="h-full cursor-pointer transition-colors hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <PackageCheck size={20} className="text-primary" />
              </div>
              <CardTitle className="mt-3 text-base">{t('page.home.update_title')}</CardTitle>
              <CardDescription>{t('page.home.update_description')}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/settings" className="block">
          <Card className="h-full cursor-pointer transition-colors hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings size={20} className="text-primary" />
              </div>
              <CardTitle className="mt-3 text-base">{t('page.home.settings_title')}</CardTitle>
              <CardDescription>{t('page.home.settings_description')}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
