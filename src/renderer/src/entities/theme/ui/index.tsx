import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'

import { $t } from '@/entities/i18next'
import { Label, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { $theme, updateThemeMode } from '../model'
import { Button, Col, Flex, Row } from '@gravity-ui/uikit'

export const ThemeSwitcher = (): ReactNode => {
  const t = useUnit($t)
  const [theme, handleUpdateTheme] = useUnit([$theme, updateThemeMode])

  return (
    <Row
      space={{
        m: 5,
        xs: 1
      }}
      spaceRow={{
        m: 1,
        xs: 5
      }}
    >
      <Col size={3}>
        <Label htmlFor="theme-switcher">{t('entities.theme.label')}</Label>
      </Col>
      <Col size={9}>
        <Flex alignItems="center" justifyContent="flex-end">
          <Button
            view="outlined"
            size="l"
            pin="round-brick"
            selected={theme.mode === 'light'}
            onClick={() => handleUpdateTheme('light')}
          >
            {t('entities.theme.light')}
          </Button>
          <Button
            view="outlined"
            size="l"
            pin="brick-brick"
            selected={theme.mode === 'system'}
            onClick={() => handleUpdateTheme('system')}
          >
            {t('entities.theme.system')}
          </Button>
          <Button
            view="outlined"
            size="l"
            pin="brick-round"
            selected={theme.mode === 'dark'}
            onClick={() => handleUpdateTheme('dark')}
          >
            {t('entities.theme.dark')}
          </Button>
        </Flex>
      </Col>
    </Row>
  )
}
