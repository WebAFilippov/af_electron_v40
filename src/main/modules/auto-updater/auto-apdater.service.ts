import { BrowserWindow } from 'electron'

import electronUpdater, { type AppUpdater } from 'electron-updater'

export const autoUpdater = (): AppUpdater => {
  const [window] = BrowserWindow.getAllWindows()
  const { autoUpdater } = electronUpdater

  autoUpdater.autoRunAppAfterInstall = true
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.forceDevUpdateConfig = true

  // Проверка обновлений
  autoUpdater.on('checking-for-update', () => {
    console.log('object');
    const data = {
      status: 'checking-for-update'
    }

    window.webContents.send('update_data', data)
  })

  // Обработка ошибок
  autoUpdater.on('error', (error, message) => {
    const data = {
      status: 'error',
      data: { error, message }
    }

    window.webContents.send('update_data', data)
  })

  // Обновление доступно
  autoUpdater.on('update-available', (info) => {
    const data = {
      status: 'update-available',
      data: info
    }

    window.webContents.send('update_data', data)
  })

  //  Обновление отсутствует
  autoUpdater.on('update-not-available', (info) => {
    const data = {
      status: 'update-not-available',
      data: info
    }

    window.webContents.send('update_data', data)
  })

  // Обновление загружено
  autoUpdater.on('update-downloaded', (info) => {
    const data = {
      status: 'update-downloaded',
      data: info
    }

    window.webContents.send('update_data', data)
    autoUpdater.autoInstallOnAppQuit = true
  })

  // Прогресс загрузки
  autoUpdater.on('download-progress', (info) => {
    const data = {
      status: 'download-progress',
      data: info
    }

    window.webContents.send('update_data', data)
  })

  return autoUpdater
}
