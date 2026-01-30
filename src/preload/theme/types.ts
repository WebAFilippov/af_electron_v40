import { ThemeProps } from '@/shared_app/types'

export interface IThemeApp {
  getTheme: () => Promise<ThemeProps>
  setTheme: (mode: ThemeProps['mode']) => Promise<ThemeProps>
  onUpdateSystemTheme: (callback: (theme: ThemeProps) => void) => void
}
