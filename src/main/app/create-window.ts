import appIcon from '../../../build/icon.ico?asset'
import { BrowserWindow, nativeImage, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import { settingsStore } from '@/modules/settings/settings.store'
import { applyThemeToWindow } from '@/modules/settings/settings.controller'
import { t } from '@/modules/settings/translations'

let mainWindow: BrowserWindow | null = null

export const createWindow = (): BrowserWindow => {
  const autoLaunch = settingsStore.get('autoLaunch')
  const startMinimized = settingsStore.get('startMinimized')
  const shouldStartHidden = autoLaunch || startMinimized

  const {
    bounds: { width, height }
  } = screen.getPrimaryDisplay()

  mainWindow = new BrowserWindow({
    minWidth: width / 3,
    minHeight: height / 2,
    width: width * 0.8,
    height: height * 0.8,
    center: true,
    show: shouldStartHidden,
    resizable: true,
    focusable: true,
    fullscreen: false,
    title: t('app_title'),
    titleBarStyle: 'hidden',
    autoHideMenuBar: false,
    minimizable: true,
    maximizable: true,
    fullscreenable: true,
    frame: false,
    trafficLightPosition: {
      x: 5,
      y: 5
    },
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      plugins: false,
      devTools: true
    }
  })

  applyThemeToWindow(mainWindow, settingsStore.get('theme'))

  mainWindow.flashFrame(false)
  mainWindow.setOverlayIcon(nativeImage.createFromPath(appIcon), 'Effectory')
  // mainWindow.setMenu(null)
  // mainWindow.setMenuBarVisibility(false)
  // mainWindow.setSkipTaskbar(false)
  // Menu.setApplicationMenu(null)

  if (!shouldStartHidden) {
    mainWindow.once('ready-to-show', () => {
      mainWindow?.show()
    })
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export const updateWindow = (): void => {
  mainWindow?.setTitle(t('app_title'))
}
