import { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue
} from '@/shared/ui'
import { $theme, setTheme } from '../model/model'

export const ThemeSwitcher = (): ReactNode => {
  const [theme, handleSetTheme] = useUnit([$theme, setTheme])

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="lang-swither">Тема приложения</Label>
      <Select value={theme.mode} onValueChange={handleSetTheme}>
        <SelectTrigger className="min-w-45 w-fit" id="lang-swither">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-70">
          <SelectScrollUpButton />
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
            <SelectScrollDownButton />
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
