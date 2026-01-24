import appIcon from '../../../build/icon.ico?asset'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'

import type { AppUpdater } from 'electron-updater'
import i18next, { t } from 'i18next'

let tray: Tray | null = null
let currentUpdater: AppUpdater | undefined = undefined

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
  const [window] = BrowserWindow.getAllWindows()

  return Menu.buildFromTemplate([
    {
      label: window.isVisible() ? t('tray.control_window.hide') : t('tray.control_window.show'),
      click: toggleWindowVisibility
    },
    {
      label: 'language',
      click: () => i18next.changeLanguage('en')
    },
    {
      label: t('tray.exit'),
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

export const createTray = (updater?: AppUpdater): Tray => {
  currentUpdater = updater

  tray = new Tray(nativeImage.createFromPath(appIcon))

  tray.setToolTip(t('tray.tooltip'))
  tray.setTitle(t('tray.title'))
  tray.setContextMenu(buildMenu())

  const [window] = BrowserWindow.getAllWindows()

  window.on('show', updateTrayMenu)
  window.on('hide', updateTrayMenu)
  window.on('minimize', updateTrayMenu)
  window.on('restore', updateTrayMenu)

  tray.on('click', toggleWindowVisibility)
  tray.on('double-click', toggleWindowVisibility)
  tray.on('right-click', () => tray?.popUpContextMenu(buildMenu()))

  return tray
}

export const updateTrayMenu = (): void => {
  if (!tray) return
  tray.setContextMenu(buildMenu())
}

i18next.on('languageChanged', () => {
  updateTrayMenu()
  tray?.setToolTip(t('tray.tooltip'))
  tray?.setTitle(t('tray.title'))
})
