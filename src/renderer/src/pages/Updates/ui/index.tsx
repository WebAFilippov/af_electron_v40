import type { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { History, Settings2 } from 'lucide-react'
import { UpdateChangelogPanel, UpdateSettingsPanel, UpdateStatusPanel } from '@/entities/updater'
import { $t } from '@/entities/i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { GateUpdatesPage } from '../model'
export const UpdatePage = (): ReactNode => {
  useGate(GateUpdatesPage)
  const t = useUnit($t)
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('page.updates.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('page.updates.description')}</p>
      </div>
      {/* Current update status */}
      <UpdateStatusPanel />
      {/* Update preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings2 className="h-5 w-5" />
            {t('page.updates.settings_title')}
          </CardTitle>
          <CardDescription>{t('page.updates.settings_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateSettingsPanel />
        </CardContent>
      </Card>
      {/* Release history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-5 w-5" />
            {t('page.updates.history_title')}
          </CardTitle>
          <CardDescription>{t('page.updates.history_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateChangelogPanel />
        </CardContent>
      </Card>
    </div>
  )
}