import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Bell } from 'lucide-react'
import { $t } from '@/entities/i18next'
import { $checkForUpdatesOnStartup, toggleCheckForUpdatesOnStartup } from '@/entities/check-for-updates-on-startup'
import { Label, Switch } from '@/shared/ui'
import { formatBytes } from '../utils'
import { $updateData } from '../model/model-updater'
/**
 * Update-related preferences. Only settings that actually reach the main
 * process live here — the former "auto update mode" radio group was renderer
 * localStorage that never affected `autoUpdater`, so it was removed.
 */
export const UpdateSettingsPanel = (): ReactNode => {
  const t = useUnit($t)
  const [checkOnStartup, toggleCheckOnStartup, updateData] = useUnit([
    $checkForUpdatesOnStartup,
    toggleCheckForUpdatesOnStartup,
    $updateData
  ])
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="check-on-startup" className="cursor-pointer text-base font-medium">
              {t('page.updates.settings_check_on_startup')}
            </Label>
            <p className="text-sm text-muted-foreground">{t('page.updates.settings_check_on_startup_hint')}</p>
          </div>
        </div>
        <Switch id="check-on-startup" checked={checkOnStartup} onCheckedChange={toggleCheckOnStartup} />
      </div>
      {updateData.status === 'update-downloaded' && (
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm">
          <span className="text-muted-foreground">{t('page.updates.settings_package_size')}</span>
          <span className="font-medium">
            {updateData.data.files?.[0]?.size ? formatBytes(updateData.data.files[0].size) : '—'}
          </span>
        </div>
      )}
    </div>
  )
}