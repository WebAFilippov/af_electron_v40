import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  // === НОВОЕ: System Info ===
  getSystemInfo: () => Promise<SystemInfoResponse>
  getProcesses: () => Promise<ProcessesResult>

  // === Display ===
  getDisplays: () => Promise<Display[]>
  addedDisplay: (callback: (data: Display) => void) => void
  removedDisplay: (callback: (data: Display) => void) => void
  displayMetricsChange: (
    callback: (data: { display: Display; changeMetrics: string[] }) => void
  ) => void

  // === Updater ===
  onUpdateData: (callback: (data: UpdateDataDto) => void) => void
  successfulUpdate: () => Promise<{ version: string; updated: boolean }>
  checkForUpdates: () => Promise<UpdateCheckResult | null>
  retryDowmload: () => void
  startDownload: () => void
  installNow: () => void
  installOnQuit: () => void

  // === Window ===
  windowState: (callback: (state: WindowState) => void) => void
  updateWindowTheme: (theme: Theme) => void
  getWindowTheme: () => Promise<Theme>
  toggleFullscreenWindow: () => void
  minimazeWindow: () => void
  maximazeWindow: () => void
  closeWindow: () => void

  // === External Link ===
  openExternal: (url: string) => void

  onUdpData: (callback: (data: { pos: number; adc: number; ip: string }) => void) => void
  onMediaData: (callback: (data: MediaMessage) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
