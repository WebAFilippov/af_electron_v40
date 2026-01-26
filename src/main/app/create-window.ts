import appIcon from '../../../build/icon.ico?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import { settingsStore } from '@/modules/settings/settings.store'
import { applyThemeToWindow } from '@/modules/settings/settings.controller'

import { BrowserWindow, Menu, screen } from 'electron/main'
import { nativeImage } from 'electron'
import i18next, { t } from 'i18next'

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
    title: t('window.title'),
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

  mainWindow.setMenu(null)
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setSkipTaskbar(false)
  Menu.setApplicationMenu(null)

  mainWindow.on('ready-to-show', () =>
    triggerStart ? mainWindow?.hide() : startMinimized ? mainWindow?.hide() : mainWindow?.show()
  )

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(import.meta.dirname, '../renderer/index.html'), { hash: 'home' })
  }

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow?.webContents.openDevTools({ mode: 'bottom' })
  })

  return mainWindow
}

i18next.on('languageChanged', () => {
  mainWindow?.setTitle(t('window.title'))
})
