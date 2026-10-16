
import { useUnit } from 'effector-react'
import { AlertCircle, CheckCircle2, Clock, Download, Loader2, Package, RefreshCw, Rocket } from 'lucide-react'
import { $t } from '@/entities/i18next'
import { Badge, Button, Card, CardContent, CardHeader, Progress } from '@/shared/ui'
import { cn } from '@/shared/lib'
import type { UpdateStatusDto } from '../../updater/types'
import {
  $updateData,
  $versionApp,
  checkForUpdateFx,
  downloadUpdateFx,
  installNowUpdateFx,
  InstallOnQuitUpdateFx,
  retryDownloadFx
} from '../model/model-updater'
import { formatBytes } from '../utils'

type StatusVariant = 'neutral' | 'checking' | 'success' | 'info' | 'ready' | 'error'

const STATUS_ICONS: Record<UpdateStatusDto, typeof RefreshCw> = {
  idle: RefreshCw,
  'checking-for-update': Loader2,
  'update-not-available': CheckCircle2,
  'update-available': Rocket,
  'download-progress': Download,
  'update-downloaded': Package,
  error: AlertCircle
}

const STATUS_VARIANTS: Record<UpdateStatusDto, StatusVariant> = {
  idle: 'neutral',
  'checking-for-update': 'checking',
  'update-not-available': 'success',
  'update-available': 'info',
  'download-progress': 'checking',
  'update-downloaded': 'ready',
  error: 'error'
}
const VARIANT_ICON_STYLES: Record<StatusVariant, string> = {
  neutral: 'bg-muted text-muted-foreground',
  checking: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600 dark:text-green-500',
  info: 'bg-primary/10 text-primary',
  ready: 'bg-primary/10 text-primary',
  error: 'bg-destructive/10 text-destructive'
}
const VARIANT_BADGE: Record<StatusVariant, 'default' | 'secondary' | 'destructive'> = {
  neutral: 'secondary',
  checking: 'secondary',
  success: 'default',
  info: 'secondary',
  ready: 'default',
  error: 'destructive'
}

export const UpdateStatusPanel = () => {
  const t = useUnit($t)
  const [
    updateData,
    versionApp,
    handleRetryDownload,
    handleCheckForUpdate,
    handleDownload,
    handleInstallNow,
    handleInstallOnQuit
  ] = useUnit([
    $updateData,
    $versionApp,
    retryDownloadFx,
    checkForUpdateFx,
    downloadUpdateFx,
    installNowUpdateFx,
    InstallOnQuitUpdateFx
  ])

    const status = updateData.status
  const variant = STATUS_VARIANTS[status]
  const Icon = STATUS_ICONS[status]
  const isChecking = status === 'checking-for-update'
  const isError = status === 'error'
  const availableVersion =
    status === 'update-available' || status === 'update-downloaded' ? updateData.data.version : null
  const releaseName =
    status === 'update-available' || status === 'update-downloaded' ? updateData.data.releaseName : null


   return (
    <Card
      className={cn(
        'overflow-hidden transition-colors',
        variant === 'success' && 'border-green-500/50',
        variant === 'error' && 'border-destructive/50',
        variant === 'ready' && 'border-primary/50'
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', VARIANT_ICON_STYLES[variant])}>
              <Icon className={cn('h-6 w-6', isChecking && 'animate-spin')} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                {t(`page.updates.status_${status.replace(/-/g, '_')}_title`)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(`page.updates.status_${status.replace(/-/g, '_')}_description`)}
              </p>
            </div>
          </div>
          <Badge variant={VARIANT_BADGE[variant]}>{t(`page.updates.status_${status.replace(/-/g, '_')}_badge`)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version info */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{t('page.updates.current_version')}</span>
            <strong className="text-foreground">{versionApp || '—'}</strong>
          </div>
          {availableVersion && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rocket className="h-4 w-4" />
              <span>{t('page.updates.available_version')}</span>
              <strong className="text-primary">{availableVersion}</strong>
            </div>
          )}
          {releaseName && <span className="text-muted-foreground">{releaseName}</span>}
        </div>
        {/* Error message */}
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {updateData.data?.message || updateData.data?.error?.message || t('page.updates.error_unknown')}
          </div>
        )}
        {/* Download progress */}
        {status === 'download-progress' && (
          <div className="space-y-2">
            <Progress value={updateData.data.percent} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {formatBytes(updateData.data.transferred)} / {formatBytes(updateData.data.total)}
              </span>
              <span>
                {formatBytes(updateData.data.bytesPerSecond, true)} · {updateData.data.percent.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-1">
          {(status === 'idle' || status === 'update-not-available' || isChecking) && (
            <Button onClick={() => handleCheckForUpdate()} disabled={isChecking} className="gap-2">
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('page.updates.action_checking')}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {t('page.updates.action_check')}
                </>
              )}
            </Button>
          )}
          {status === 'update-available' && (
            <Button onClick={() => handleDownload()} className="gap-2">
              <Download className="h-4 w-4" />
              {t('page.updates.action_download')}
            </Button>
          )}
          {status === 'update-downloaded' && (
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button onClick={() => handleInstallNow()} className="flex-1 gap-2">
                <Rocket className="h-4 w-4" />
                {t('page.updates.action_install_now')}
              </Button>
              <Button variant="outline" onClick={() => handleInstallOnQuit()} className="flex-1 gap-2">
                <Clock className="h-4 w-4" />
                {t('page.updates.action_install_on_quit')}
              </Button>
            </div>
          )}
          {isError && (
            <Button variant="outline" onClick={() => handleRetryDownload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('page.updates.action_retry')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
