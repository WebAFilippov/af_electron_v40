import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { $autoStartMinimazed, toggleAutoStartMinimazed } from '../model/model'
import { $t } from '@/entities/i18next'

export const AutoStartMinimaze = (): ReactNode => {
  const t = useUnit($t)
  const [isAutoStartMinimazed, handleToggleAutoStartMinimazed] = useUnit([
    $autoStartMinimazed,
    toggleAutoStartMinimazed
  ])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-auto-start">{t('entities.autoStartMinimized.label')}</Label>
      <Switch
        id="switch-auto-start"
        checked={isAutoStartMinimazed}
        onCheckedChange={handleToggleAutoStartMinimazed}
      />
    </div>
  )
}
