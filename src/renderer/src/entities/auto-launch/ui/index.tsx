import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'
import { ReactNode } from 'react'
import { $autoLaunch, toggleAutoLaunch } from '../model'

export const AutoLaunch = (): ReactNode => {
  const [autoLaunch, handleToggleAutoLaunch] = useUnit([$autoLaunch, toggleAutoLaunch])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-auto-launch" className="text-base">
        Запуск при загрузке
      </Label>
      <Switch
        id="switch-auto-launch"
        checked={autoLaunch}
        onCheckedChange={handleToggleAutoLaunch}
      />
    </div>
  )
}
