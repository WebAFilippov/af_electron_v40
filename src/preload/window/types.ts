import { WindowAppProps } from '../../shared/types'

export interface IWindowApp {
  onState: (callback: (state: WindowAppProps) => void) => void
  toggleFullScreen: () => void
  setMinimize: () => void
  setMaximize: () => void
  setClose: () => void
}
