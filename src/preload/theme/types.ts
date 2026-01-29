import { ThemeProps } from '../../shared/types'

export interface IThemeApp {
  setTheme: (mode: ThemeProps['mode']) => Promise<ThemeProps>
  onUpdateSystemTheme: (callback: (theme: ThemeProps) => void) => void
}
