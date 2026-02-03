import type { ReactNode } from 'react'
import { UpdateStatusPanel } from '@/entities/updater/ui/update-status-panel'
import { UpdateSettingsPanel } from '@/entities/updater/ui/update-settings-panel'
import { UpdateChangelogPanel } from '@/entities/updater/ui/update-changelog-panel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { InstallingUpdates02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export const UpdatePage = (): ReactNode => {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <HugeiconsIcon icon={InstallingUpdates02Icon} className="h-8 w-8 text-primary" />
            Обновление приложения
          </h1>
          <p className="text-muted-foreground mt-2">Управление обновлениями и настройки автоматического обновления</p>
        </div>

        {/* Main Status Panel */}
        <UpdateStatusPanel />

        {/* Settings & Changelog Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Настройки обновления</CardTitle>
              <CardDescription>Настройте автоматическое обновление приложения</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateSettingsPanel />
            </CardContent>
          </Card>

          {/* Changelog Panel */}
          <Card>
            <CardHeader>
              <CardTitle>История изменений</CardTitle>
              <CardDescription>Список изменений в последних версиях</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateChangelogPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
