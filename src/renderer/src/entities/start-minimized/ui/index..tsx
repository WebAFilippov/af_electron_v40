import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'

import { $t } from '@/entities/i18next'
import { $startMinimized, toggleStartMinimized } from '../model'

export const StartMinimized = (): ReactNode => {
  const t = useUnit($t)
  const [checked, toggle] = useUnit([$startMinimized, toggleStartMinimized])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-start-minimized">{t('entities.startMinimized.label')}</Label>
      <Switch id="switch-start-minimized" checked={checked} onCheckedChange={toggle} />
    </div>
  )
}
