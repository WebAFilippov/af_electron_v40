import { app, ipcMain } from 'electron'


export const ipcUpdater = (autoUpdater) => {
  ipcMain.handle('successful_update', async () => {
    const version = app.getVersion()
    const updated = version !== '0.0.1'

    return {
      version,
      updated
    }
  })

  ipcMain.handle('checking_for_update', async () => {
    try {
      return await autoUpdater.checkForUpdates()
    } catch (error) {
      return error
    }
  })

  ipcMain.on('retry_checking_for_update', async () => {
    return await autoUpdater.checkForUpdates()
  })

  ipcMain.on('start_download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.on('install_now', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.on('install_on_quit', () => {
    autoUpdater.autoInstallOnAppQuit = true
  })
}
