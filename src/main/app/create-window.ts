import appIcon from '../../../build/icon.ico?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import { settingsStore } from '@/modules/settings/settings.store'
import { applyThemeToWindow } from '@/modules/settings/settings.controller'
import { t } from '@/modules/settings/translations'
import { BrowserWindow, Menu, screen } from 'electron/main'
import { nativeImage } from 'electron'

let mainWindow: BrowserWindow | null = null

export const createWindow = (): BrowserWindow => {
  const triggerStart = process.argv.includes('--auto-launch')
  const startMinimized = settingsStore.get('startMinimized')

  const {
    bounds: { width, height }
  } = screen.getPrimaryDisplay()

  mainWindow = new BrowserWindow({
    minWidth: width / 3,
    minHeight: height / 2,
    width: width * 0.8,
    height: height * 0.8,
    center: true,
    show: false,
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
  if (!is.dev) {
    mainWindow.setMenu(null)
    mainWindow.setMenuBarVisibility(false)
    mainWindow.setSkipTaskbar(false)
    Menu.setApplicationMenu(null)
  }

  mainWindow.on('ready-to-show', () =>
    triggerStart ? mainWindow?.hide() : startMinimized ? mainWindow?.hide() : mainWindow?.show()
  )

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
