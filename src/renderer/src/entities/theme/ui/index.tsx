import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import { $t } from '@/entities/i18next'
import { Label, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { $theme, updateThemeMode } from '../model'

export const ThemeSwitcher = (): ReactNode => {
  const t = useUnit($t)
  const [theme, handleUpdateTheme] = useUnit([$theme, updateThemeMode])

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="theme-switcher">{t('entities.theme.label')}</Label>
      <Select value={theme.mode} onValueChange={handleUpdateTheme}>
        <SelectTrigger className="min-w-45 w-fit" id="theme-switcher">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-70">
          <SelectGroup>
            <SelectItem value="light" disabled={theme.mode === 'light'}>
              {t('entities.theme.light')}
            </SelectItem>
            <SelectItem value="dark" disabled={theme.mode === 'dark'}>
              {t('entities.theme.dark')}
            </SelectItem>
            <SelectItem value="system" disabled={theme.mode === 'system'}>
              {t('entities.theme.system')}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
