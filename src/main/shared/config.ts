import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { join } from 'path'

export const linkCreateIssue = 'https://github.com/my-acc/my-app/issues/new'
const PathUserData = app.getPath('userData')
const PathResources = is.dev
  ? join(app.getAppPath(), 'resources')
  : join(app.getAppPath(), 'resources').replace('app.asar', 'app.asar.unpacked')

export const Config = {
  PathUserData,
  PathResources
}
