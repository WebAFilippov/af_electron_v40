import type { ReactNode } from 'react'

import { AutoLaunch } from '@/entities/auto-launch'
import { StartMinimized } from '@/entities/start-minimized'
import { LanguageSwitcher } from '@/entities/i18next'
import { ThemeSwitcher } from '@/entities/theme'
import { CheckForUpdatesOnStartup } from '@/entities/check-for-updates-on-startup'
import { useGate } from 'effector-react'
import { GateSettingsPage } from '../model'

export const SettingsPage = (): ReactNode => {
  useGate(GateSettingsPage)

  return (
    <div className="flex flex-col gap-3">
      <LanguageSwitcher />
      <ThemeSwitcher />
      <AutoLaunch />
      <StartMinimized />
      <CheckForUpdatesOnStartup />
    </div>
  )
}
