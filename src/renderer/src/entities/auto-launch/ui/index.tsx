import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import { $t } from '@/entities/i18next'
import { Label, Switch } from '@/shared/ui'
import { $autoLaunch, toggleAutoLaunch } from '../model'

export const AutoLaunch = (): ReactNode => {
  const t = useUnit($t)
  const [checked, toggle] = useUnit([$autoLaunch, toggleAutoLaunch])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-auto-launch">{t('entities.autoLaunch.label')}</Label>
      <Switch id="switch-auto-launch" checked={checked} onCheckedChange={toggle} />
    </div>
  )
}
