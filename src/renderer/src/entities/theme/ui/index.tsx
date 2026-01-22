import { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui'
import { $theme, setThemeFx } from '../model'

export const ThemeSwitcher = (): ReactNode => {
  const [theme, handleSetTheme] = useUnit([$theme, setThemeFx])

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="theme-switcher" className="text-base">
        Тема приложения
      </Label>
      <Select value={theme.mode} onValueChange={handleSetTheme}>
        <SelectTrigger className="min-w-45 w-fit" id="theme-switcher">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-70">
          <SelectGroup>
            <SelectItem value="light" disabled={theme.mode === 'light'}>
              Светлая
            </SelectItem>
            <SelectItem value="dark" disabled={theme.mode === 'dark'}>
              Темная
            </SelectItem>
            <SelectItem value="system" disabled={theme.mode === 'system'}>
              Системная
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
