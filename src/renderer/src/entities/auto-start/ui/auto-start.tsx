import { Label, Switch } from '@/shared/ui'
import { useUnit } from 'effector-react'
import { ReactNode } from 'react'
import { $autoStart, toggleAutoStart } from '../model/model'

export const AutoStart = (): ReactNode => {
  const [isAutoStart, handleToggleAutoStart] = useUnit([$autoStart, toggleAutoStart])

  return (
    <div className="w-full flex justify-between items-center h-10">
      <Label htmlFor="switch-auto-start">Запуск при загрузке</Label>
      <Switch
        id="switch-auto-start"
        checked={isAutoStart}
        onCheckedChange={handleToggleAutoStart}
      />
    </div>
  )
}
