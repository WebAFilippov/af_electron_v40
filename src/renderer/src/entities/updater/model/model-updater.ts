import { UpdateDataDto } from '../types'
import { createEffect, createEvent, restore, sample, createStore } from 'effector'
import { UpdateCheckResult } from 'electron-updater'
import { toast } from 'sonner'
import { persist } from 'effector-storage/local'
import { ReleaseProps } from '@/shared_app/types'

const DEFAULT_UPDATE_DATA = { status: 'idle' } as const
const ID_TOKEN_LOADING = 'token_toast_check_for_update' as const

// Update status
window.updater_app.onUpdateData((data) => {
  setUpdateData(data)
})

// Error effect
const retryDownloadFx = createEffect(() => {
  window.updater_app.retryDownload()
})

// Successful effect
const successfulFx = createEffect(() => window.updater_app.successfulUpdate())
const toastSuccessfulFx = createEffect((updated: boolean) => {
  updated && toast.success('Обновление успешно установлено!')
})
const toastErrorSuccessfulFx = createEffect((error: Error) => {
  toast.error(error.message)
})

// CheckForUpdate effect
const checkForUpdateFx = createEffect<void, UpdateCheckResult | null, Error>(() => window.updater_app.checkForUpdates())
const toastLoadingCheckForUpdateFx = createEffect(() => {
  toast.loading('Проверяется обновление ПО...', { id: ID_TOKEN_LOADING })
})
const cancelToastCheckForUpdateFx = createEffect(() => {
  toast.dismiss(ID_TOKEN_LOADING)
})

// Download effect
const downloadUpdateFx = createEffect(() => window.updater_app.startDownload())

// Update not available effect
const toastUpdateNotAvailableFx = createEffect(() => {
  toast.info('Обновление не найдены')
})

// Install now effect
const installNowUpdateFx = createEffect(() => {
  window.updater_app.installNow()
  setUpdateData(DEFAULT_UPDATE_DATA)
})

// install on quit effect
const InstallOnQuitUpdateFx = createEffect(() => {
  window.updater_app.installOnQuit()
  setUpdateData(DEFAULT_UPDATE_DATA)
  setIsDownloaded(true)
})

// Release history effect
const loadReleasesFx = createEffect<void, ReleaseProps[]>(() => window.updater_app.getReleases())


const setVersionApp = createEvent<string>()
const setUpdatedApp = createEvent<boolean>()
const setIsDownloaded = createEvent<boolean>()
const setUpdateData = createEvent<UpdateDataDto>()

const $versionApp = restore(setVersionApp, '')
const $updatedApp = restore(setUpdatedApp, false)
const $isDowloaded = restore(setIsDownloaded, false)
const $updateData = restore<UpdateDataDto>(setUpdateData, DEFAULT_UPDATE_DATA)

const $releases = createStore<ReleaseProps[]>([]).on(loadReleasesFx.doneData, (_, releases) => releases)
const $releasesPending = loadReleasesFx.pending

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


// Persist settings to localStorage

persist({
  store: $versionApp,
  key: 'app-version'
})

export {
   $versionApp,
  $updatedApp,
  $updateData,
  $isDowloaded,
  $releases,
  $releasesPending,
  successfulFx,
  checkForUpdateFx,
  retryDownloadFx,
  downloadUpdateFx,
  installNowUpdateFx,
  InstallOnQuitUpdateFx,
  loadReleasesFx,
  setIsDownloaded
}
