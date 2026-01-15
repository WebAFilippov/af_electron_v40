import { t } from '@/modules/i18n/trans'
import appIcon from '../../../build/icon.ico?asset'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'

import { AppUpdater } from 'electron-updater'

let tray: Tray | null = null
let currentUpdater: AppUpdater | null = null

const toggleWindowVisibility = (): void => {
  const [window] = BrowserWindow.getAllWindows()

  if (window.isVisible()) {
    window.hide()
  } else {
    if (window.isMinimized()) {
      window.restore()
    }
    window.show()
  }
}

const buildMenu = (): Menu => {
  return Menu.buildFromTemplate([
    {
      label: t('tray_label'),
      click: toggleWindowVisibility
    },
    { type: 'separator' },
    {
      label: t('tray_exit'),
      click: () => {
        if (currentUpdater && currentUpdater.autoInstallOnAppQuit) {
          currentUpdater.quitAndInstall()
        } else {
          app.quit()
        }
      }
    }
  ])
}

export const createTray = (updater: AppUpdater): Tray => {
  currentUpdater = updater

  tray = new Tray(nativeImage.createFromPath(appIcon))

  tray.setToolTip(t('app_title'))
  tray.setTitle(t('app_title'))
  tray.setContextMenu(buildMenu())

  tray.on('click', toggleWindowVisibility)
  tray.on('double-click', toggleWindowVisibility)

  tray.on('right-click', () => {
    tray?.popUpContextMenu(buildMenu())
  })

  return tray
}

export const updateTray = (): void => {
  if (!tray) return

  tray.setToolTip(t('app_title'))
  tray.setContextMenu(buildMenu())
}
