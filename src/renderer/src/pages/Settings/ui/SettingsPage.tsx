import type { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { CircleHelp, Database, Globe, MapPin, Rocket } from 'lucide-react'
import { Link } from 'react-router'

import { AutoLaunch } from '@/entities/auto-launch'
import { StartMinimized } from '@/entities/start-minimized'
import { $t, LanguageSwitcher } from '@/entities/i18next'
import { ThemeSwitcher } from '@/entities/theme'
import { $currentLocation } from '@/entities/location'
import { reopenOnboarding } from '@/features/onboarding'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '@/shared/ui'
import { GateSettingsPage } from '../model'

export const SettingsPage = (): ReactNode => {
  useGate(GateSettingsPage)
  const t = useUnit($t)
  const [location, handleReopenOnboarding] = useUnit([$currentLocation, reopenOnboarding])

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.settings.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.settings.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5" />
            {t('page.settings.appearance_title')}
          </CardTitle>
          <CardDescription>{t('page.settings.appearance_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Rocket className="h-5 w-5" />
            {t('page.settings.startup_title')}
          </CardTitle>
          <CardDescription>{t('page.settings.startup_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AutoLaunch />
          <StartMinimized />
        </CardContent>
      </Card>

      {/* The city is shown here as well as on the weather page: it is the one piece
          of user data the app stores, and hiding where it lives makes the app feel
          opaque. */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5" />
            {t('page.settings.data_title')}
          </CardTitle>
          <CardDescription>{t('page.settings.data_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{t('page.settings.data_city')}</div>
              <div className="text-sm text-muted-foreground">
                {location ? `${location.city}, ${location.country}` : t('page.settings.data_city_empty')}
              </div>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link to="/weather">{t('page.settings.data_city_change')}</Link>
            </Button>
          </div>

          <Separator />

          <div className="flex items-start gap-3 text-xs text-muted-foreground">
            <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="leading-relaxed">{t('page.settings.data_storage')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Lets the user bring back the first-run wizard, which is otherwise shown
          exactly once. */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CircleHelp className="h-5 w-5" />
            {t('page.settings.help_title')}
          </CardTitle>
          <CardDescription>{t('page.settings.help_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{t('page.settings.help_wizard')}</span>
            <Button variant="outline" size="sm" onClick={() => handleReopenOnboarding()}>
              {t('page.settings.help_wizard_action')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
