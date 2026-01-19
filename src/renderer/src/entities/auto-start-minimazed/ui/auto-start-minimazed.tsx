import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'
import { ReactNode } from 'react'
import { $autoStartMinimazed, toggleAutoStartMinimazed } from '../model/model'

export const AutoStartMinimazed = (): ReactNode => {
  const [isAutoStartMinimazed, handleToggleAutoStartMinimazed] = useUnit([
    $autoStartMinimazed,
    toggleAutoStartMinimazed
  ])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-auto-start">Запуск в свёрнутом виде</Label>
      <Switch
        id="switch-auto-start"
        checked={isAutoStartMinimazed}
        onCheckedChange={handleToggleAutoStartMinimazed}
      />
    </div>
  )
}
