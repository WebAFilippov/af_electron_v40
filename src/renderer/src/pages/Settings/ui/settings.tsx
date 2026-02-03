import type { ReactNode } from 'react'

import { AutoLaunch } from '@/entities/auto-launch'
import { StartMinimized } from '@/entities/start-minimized'
import { LanguageSwitcher } from '@/entities/i18next'
import { ThemeSwitcher } from '@/entities/theme'
import { CheckForUpdatesOnStartup } from '@/entities/check-for-updates-on-startup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { Globe, Monitor, Rocket, Bell } from 'lucide-react'
import { useGate } from 'effector-react'
import { GateSettingsPage } from '../model'

export const SettingsPage = (): ReactNode => {
  useGate(GateSettingsPage)

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-2">Настройте приложение под свои предпочтения</p>
        </div>

        {/* General Settings - Language & Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5" />
              Общие настройки
            </CardTitle>
            <CardDescription>Язык интерфейса и внешний вид приложения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Язык</label>
                <LanguageSwitcher />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Тема</label>
                <ThemeSwitcher />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Startup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-5 w-5" />
              Запуск
            </CardTitle>
            <CardDescription>Настройки автоматического запуска приложения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <AutoLaunch />
              <StartMinimized />
            </div>
          </CardContent>
        </Card>

        {/* Updates Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5" />
              Обновления
            </CardTitle>
            <CardDescription>Настройки проверки обновлений приложения</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckForUpdatesOnStartup />
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Monitor className="h-5 w-5" />О приложении
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Версия</span>
                <span className="font-medium">0.0.1</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Electron</span>
                <span className="font-medium">40.0.0</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">React</span>
                <span className="font-medium">19.2.1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
