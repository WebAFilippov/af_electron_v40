import { AppLanguage } from './../../../shared/types'
import { ipcMain } from 'electron/main'
import { channels } from '../../../shared/types'
import { getLanguage, setLanguage } from './i18next.service'
import { join } from 'path'
import { readFile } from 'node:fs'
import { Config } from '@/shared/config'

export const ipci18next = (): void => {
  ipcMain.handle(channels.i18next_change_language, (_, language) => {
    return setLanguage(language)
  })

  ipcMain.handle(channels.i18next_get_language, () => {
    return getLanguage()
  })

  ipcMain.handle(channels.i18next_get_resources, (_, lang: AppLanguage) => {
    const filePath = join(Config.pathResources, `locales/${lang}/renderer.json`)

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
