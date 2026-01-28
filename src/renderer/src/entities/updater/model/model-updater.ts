import { UpdateDataDto } from '../types'
import { createEffect, createEvent, restore, sample } from 'effector'
import { UpdateCheckResult } from 'electron-updater'
import { toast } from 'sonner'

const DEFAULT_UPDATE_DATA = { status: 'idle' } as const
const ID_TOKEN_LOADING = 'token_toast_check_for_update' as const

// Update status
window.api.onUpdateData((data) => {
  setUpdateData(data)
})

// Error effect
const retryDownloadFx = createEffect(() => {
  window.api.retryDownload()
})

// Successful effect
const successfulFx = createEffect(() => window.api.successfulUpdate())
const toastSuccessfulFx = createEffect((updated: boolean) => {
  updated && toast.success('Обновление успешно установлено!')
})
const toastErrorSuccessfulFx = createEffect((error: Error) => {
  toast.error(error.message)
})

// CheckForUpdate effect
const checkForUpdateFx = createEffect<void, UpdateCheckResult | null, Error>(() =>
  window.api.checkForUpdates()
)
const toastLoadingCheckForUpdateFx = createEffect(() => {
  toast.loading('Проверяется обновление ПО...', { id: ID_TOKEN_LOADING })
})
const cancelToastCheckForUpdateFx = createEffect(() => {
  toast.dismiss(ID_TOKEN_LOADING)
})

// Download effect
const downloadUpdateFx = createEffect(() => window.api.startDownload())

// Update not available effect
const toastUpdateNotAvailableFx = createEffect(() => {
  toast.info('Обновление не найдены')
})

// Install now effect
const installNowUpdateFx = createEffect(() => {
  window.api.installNow()
  setUpdateData(DEFAULT_UPDATE_DATA)
})

// install on quit effect
const InstallOnQuitUpdateFx = createEffect(() => {
  window.api.installOnQuit()
  setUpdateData(DEFAULT_UPDATE_DATA)
  setIsDownloaded(true)
})

const setVersionApp = createEvent<string>()
const setUpdatedApp = createEvent<boolean>()
const setIsDownloaded = createEvent<boolean>()
const setUpdateData = createEvent<UpdateDataDto>()

const $versionApp = restore(setVersionApp, '')
const $updatedApp = restore(setUpdatedApp, false)
const $isDowloaded = restore(setIsDownloaded, false)
const $updateData = restore<UpdateDataDto>(setUpdateData, DEFAULT_UPDATE_DATA)

// Successful sample
sample({
  clock: successfulFx.doneData,
  fn: (data) => data.version,
  target: setVersionApp
})
sample({
  clock: successfulFx.doneData,
  filter: (data) => data.updated,
  fn: (data) => data.updated,
  target: toastSuccessfulFx
})
sample({
  clock: successfulFx.failData,
  target: toastErrorSuccessfulFx
})

// Check for update sample
sample({
  clock: $updateData,
  filter: (data) => data.status === 'checking-for-update',
  target: toastLoadingCheckForUpdateFx
})
sample({
  clock: $updateData,
  filter: (data) => data.status !== 'checking-for-update',
  target: cancelToastCheckForUpdateFx
})

// Update not available sample
sample({
  clock: $updateData,
  filter: (data) => data.status === 'update-not-available',
  target: toastUpdateNotAvailableFx
})

export {
  $versionApp,
  $updatedApp,
  $updateData,
  $isDowloaded,
  successfulFx,
  checkForUpdateFx,
  retryDownloadFx,
  downloadUpdateFx,
  installNowUpdateFx,
  InstallOnQuitUpdateFx,
  setIsDownloaded
}

$updateData.watch((data) => console.log(`#data ${JSON.stringify(data)}`))
