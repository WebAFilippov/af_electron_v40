interface BlockMapDataHolder {
  size?: number
  blockMapSize?: number
  readonly sha512: string
  readonly isAdminRightsRequired?: boolean
}

interface UpdateFileInfo extends BlockMapDataHolder {
  url: string
}

interface ReleaseNoteInfo {
  readonly version: string
  readonly note: string | null
}

interface UpdateInfo {
  readonly version: string
  readonly files: Array<UpdateFileInfo>
  readonly path: string
  readonly sha512: string
  releaseName?: string | null
  releaseNotes?: string | Array<ReleaseNoteInfo> | null
  releaseDate: string
  readonly stagingPercentage?: number
  readonly minimumSystemVersion?: string
}

interface UpdateDownloadedEvent extends UpdateInfo {
  downloadedFile: string
}

interface ProgressInfo {
  total: number
  delta: number
  transferred: number
  percent: number
  bytesPerSecond: number
}

type UpdateStatusDto =
  | 'idle'
  | 'error'
  | 'checking-for-update'
  | 'update-available'
  | 'update-not-available'
  | 'update-downloaded'
  | 'download-progress'

type UpdateDataDto =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      data: {
        error: Error
        message: string | undefined
      }
    }
  | {
      status: 'checking-for-update'
    }
  | { status: 'update-available'; data: UpdateInfo }
  | { status: 'update-not-available'; data: UpdateInfo }
  | { status: 'update-downloaded'; data: UpdateDownloadedEvent }
  | { status: 'download-progress'; data: ProgressInfo }

export { type UpdateStatusDto, type UpdateDataDto }
