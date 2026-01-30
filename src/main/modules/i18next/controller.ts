import { BrowserWindow, ipcMain, Tray } from 'electron/main'
import { join } from 'path'
import { readFile } from 'node:fs'

import { getLanguage, setLanguage } from './service'
import { Config } from '@/shared/config'
import { channels, LanguageApp } from '@/shared_app/types'
import i18next, { t } from 'i18next'
import { updateTrayMenu } from '@/app/create-tray'

export const ipcI18next = (window: BrowserWindow, tray: Tray): void => {
  i18next.on('languageChanged', () => {
    window.setTitle(t('window.title'))

    updateTrayMenu()
    tray.setToolTip(t('tray.tooltip'))
    tray.setTitle(t('tray.title'))
  })

  ipcMain.handle(channels.i18next_change_language, (_, language) => {
    return setLanguage(language)
  })

  ipcMain.handle(channels.i18next_get_language, () => {
    return getLanguage()
  })

  ipcMain.handle(channels.i18next_get_resources, (_, language: LanguageApp) => {
    const filePath = join(Config.pathResources, `locales/${language}/renderer.json`)

    return new Promise((resolve, reject) => {
      readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Failed to read locale file: ${filePath}`, err)
          reject(new Error(`Failed to load locale: ${err.message}`))
          return
        }

        try {
          const parsedData = JSON.parse(data)
          resolve(parsedData)
        } catch (parseError) {
          console.error(`Failed to parse JSON: ${filePath}`, parseError)
          reject(new Error('Failed to parse locale JSON'))
        }
      })
    })
  })
}
