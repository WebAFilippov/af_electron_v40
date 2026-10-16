import { app, BrowserWindow, ipcMain } from 'electron/main'
import type { AppUpdater } from 'electron-updater'
import { settingsStore } from '../settings'
import { getReleases } from './releases'
import { channels } from '@/shared_app/types'

export const ipcUpdater = (window: BrowserWindow, autoUpdater: AppUpdater) => {
  window.on('ready-to-show', () => {
    const checkForUpdatesOnStartup = settingsStore.get('checkForUpdatesOnStartup', true)

    if (checkForUpdatesOnStartup) {
      autoUpdater.checkForUpdates()
    }
  })

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

  ipcMain.handle(channels.updater_get_releases, async () => {
    return await getReleases()
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
