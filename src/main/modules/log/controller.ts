import { ipcMain } from 'electron/main'
import { handleRendererLog } from '@/shared/utils/logger'

export const ipcLog = (): void => {
  ipcMain.on('log-from-renderer', (_, data: { level: string; message: string; meta?: Record<string, unknown> }) => {
    handleRendererLog(data.level, data.message, data.meta)
  })
}
