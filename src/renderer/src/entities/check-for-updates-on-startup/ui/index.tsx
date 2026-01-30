import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import { $t } from '@/entities/i18next'
import { Label, Switch } from '@/shared/ui'
import { $checkForUpdatesOnStartup, toggleCheckForUpdatesOnStartup } from '../model'

export const CheckForUpdatesOnStartup = (): ReactNode => {
  const t = useUnit($t)
  const [checked, toggle] = useUnit([$checkForUpdatesOnStartup, toggleCheckForUpdatesOnStartup])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-check-for-updates">{t('entities.checkForUpdatesOnStartup.label')}</Label>
      <Switch id="switch-check-for-updates" checked={checked} onCheckedChange={toggle} />
    </div>
  )
}
