import appIcon from '../../../build/icon.ico?asset'
import { BrowserWindow, Menu, nativeImage, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { setTheme } from '@/modules/theme/theme.service'
import { themeStore } from '@/modules/theme/theme.store'
import { t } from '@/modules/i18n/trans'

let mainWindow: BrowserWindow | null = null

const isAutoLaunch = process.argv.includes('--auto-launch')
const shouldStartHidden = isAutoLaunch

export const createWindow = (): BrowserWindow => {
  const {
    bounds: { width, height }
  } = screen.getPrimaryDisplay()

  mainWindow = new BrowserWindow({
    minWidth: width / 3,
    minHeight: height / 2,
    width: width * 0.8,
    height: height * 0.8,
    center: true,
    show: true,
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

  if (themeStore.get('mode') === 'system') {
    setTheme(mainWindow, 'system')
  } else {
    setTheme(mainWindow, themeStore.get('mode'))
  }

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
