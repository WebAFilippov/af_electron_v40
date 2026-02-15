import { WeatherWidget } from '@/widgets/weather-widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { InstallingUpdates02Icon, Settings02Icon, WirelessCloudAccessIcon } from '@hugeicons/core-free-icons'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'

export const HomePage = (): ReactNode => {
  const t = useUnit($t)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HugeiconsIcon icon={WirelessCloudAccessIcon} />
            {t('page.home.weather')}
          </CardTitle>
          <CardDescription>{t('page.home.weather_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/weather">
            <WeatherWidget />
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/update">
          <Card className="h-full cursor-pointer hover:bg-muted transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={InstallingUpdates02Icon} strokeWidth={2} size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('page.home.update_title')}</CardTitle>
                    <CardDescription>{t('page.home.update_description')}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('page.home.update_content')}</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="h-full cursor-pointer hover:bg-muted transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('page.home.settings_title')}</CardTitle>
                    <CardDescription>{t('page.home.settings_description')}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('page.home.settings_description')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
