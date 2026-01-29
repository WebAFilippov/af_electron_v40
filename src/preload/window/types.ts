import { WindowAppProps } from '../../shared/types'

export interface IWindowApp {
  onState: (callback: (state: WindowAppProps) => void) => void
  toggleFullScreen: () => void
  setMinimaze: () => void
  setMaximaze: () => void
  setClose: () => void
}
