import { $t } from '@/entities/i18next'
import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'

export const CheckUpdateOnStart = () => {
  const t = useUnit($t)

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-check-update">{t('features.checkUpdateOnStart.label')}</Label>
      <Switch id="switch-check-update" />
    </div>
  )
}
