import { LanguageSwitcher } from '@/entities/language'
import { ThemeSwitcher } from '@/entities/theme'
import { ReactNode } from 'react'

export const SettingsPage = (): ReactNode => {
  return (
    <div className="flex flex-col gap-4">
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  )
}
