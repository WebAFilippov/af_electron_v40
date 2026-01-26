import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { $autoLaunch, toggleAutoLaunch } from '../model'
import { $t } from '@/entities/i18next'

export const AutoLaunch = (): ReactNode => {
  const t = useUnit($t)
  const [autoLaunch, handleToggleAutoLaunch] = useUnit([$autoLaunch, toggleAutoLaunch])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-auto-launch">{t('entities.autoLaunch.label')}</Label>
      <Switch
        id="switch-auto-launch"
        checked={autoLaunch}
        onCheckedChange={handleToggleAutoLaunch}
      />
    </div>
  )
}
