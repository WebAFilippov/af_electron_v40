import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import { $t } from '@/entities/i18next'
import { Label, ToggleGroup, ToggleGroupItem } from '@/shared/ui'
import { $theme, updateThemeMode } from '../model'
import type { ThemeProps } from '@/shared_app/types'

const THEME_MODES: ThemeProps['mode'][] = ['light', 'system', 'dark']

export const ThemeSwitcher = (): ReactNode => {
  const t = useUnit($t)
  const [theme, handleUpdateTheme] = useUnit([$theme, updateThemeMode])

  return (
    <div className="flex items-center justify-between">
      <Label id="theme-switcher-label">{t('entities.theme.label')}</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        value={theme.mode}
        onValueChange={(mode: ThemeProps['mode']) => mode && handleUpdateTheme(mode)}
        aria-labelledby="theme-switcher-label"
      >
        {THEME_MODES.map((mode) => (
          <ToggleGroupItem key={mode} value={mode}>
            {t(`entities.theme.${mode}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
