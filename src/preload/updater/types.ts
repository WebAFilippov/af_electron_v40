import { UpdateDataDto } from '@/shared_app/types'
import { UpdateCheckResult } from 'electron-updater'

export interface IUpdaterApp {
  onUpdateData: (callback: (data: UpdateDataDto) => void) => void
  successfulUpdate: () => Promise<{ version: string; updated: boolean }>
  checkForUpdates: () => Promise<UpdateCheckResult | null>
  retryDownload: () => void
  startDownload: () => void
  installNow: () => void
  installOnQuit: () => void
}
