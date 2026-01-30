import { ipcRenderer } from 'electron/renderer'
import { IWindowApp } from './types'
import { channels, WindowAppProps } from '../../shared/types'

export const window_app = {
  onState: (callback) => {
    ipcRenderer.on(channels.window_on_update, (_, state: WindowAppProps) => callback(state))
  },
  toggleFullScreen: () => ipcRenderer.send(channels.window_fullscreen),
  setMinimize: () => ipcRenderer.send(channels.window_minimaze),
  setMaximize: () => ipcRenderer.send(channels.window_maximaze),
  setClose: () => ipcRenderer.send(channels.window_close)
} satisfies IWindowApp
