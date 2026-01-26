import { AutoLaunch } from '@/entities/auto-launch'
import { AutoStartMinimaze } from '@/entities/auto-start-minimazed'
import { LanguageSwitcher } from '@/entities/i18next'

import { ThemeSwitcher } from '@/entities/theme'

import type { ReactNode } from 'react'

export const SettingsPage = (): ReactNode => {
  return (
    <div className="flex flex-col gap-3">
      <LanguageSwitcher />
      <ThemeSwitcher />
      <AutoLaunch />
      <AutoStartMinimaze />
    </div>
  )
}
