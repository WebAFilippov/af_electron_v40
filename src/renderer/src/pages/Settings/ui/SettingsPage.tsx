import type { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { Globe, Rocket } from 'lucide-react'
import { AutoLaunch } from '@/entities/auto-launch'
import { StartMinimized } from '@/entities/start-minimized'
import { $t, LanguageSwitcher } from '@/entities/i18next'
import { ThemeSwitcher } from '@/entities/theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { GateSettingsPage } from '../model'

export const SettingsPage = (): ReactNode => {
  useGate(GateSettingsPage)
  const t = useUnit($t)
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('page.settings.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.settings.description')}</p>
      </div>
      {/* Appearance settings */}
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
      {/* Startup settings */}
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
    </div>
  )
}