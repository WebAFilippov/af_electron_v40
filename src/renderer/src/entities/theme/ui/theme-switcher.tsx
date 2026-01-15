import { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon02Icon, Sun } from '@hugeicons/core-free-icons'

import { ToggleGroupCustom, ToggleGroupItemCustom } from '@/shared/ui'
import { $theme, setTheme } from '../model/model'

export const ThemeSwitcher = (): ReactNode => {
  const [theme, handleSetTheme] = useUnit([$theme, setTheme])

  return (
    <div className="flex w-full justify-between items-center">
      <p className="text-[16px] font-medium select-none">Оформление приложения</p>

      <ToggleGroupCustom value={theme.mode} onChange={handleSetTheme}>
        <ToggleGroupItemCustom value="light">
          <HugeiconsIcon icon={Sun} />
          <span >Светлая</span>
        </ToggleGroupItemCustom>
        <ToggleGroupItemCustom value="dark">
          <HugeiconsIcon icon={Moon02Icon} />
          <span >Темная</span>
        </ToggleGroupItemCustom>
        <ToggleGroupItemCustom value="system">
          <span >Системная</span>
        </ToggleGroupItemCustom>
      </ToggleGroupCustom>
    </div>
  )
}
