import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Badge } from '@/shared/ui'
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
import { useUnit } from 'effector-react'
import { cn } from '@/shared/lib'
import { CheckCircle2, Download, AlertCircle, Loader2, RefreshCw, Rocket, Clock, Package } from 'lucide-react'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'idle':
      return {
        icon: RefreshCw,
        title: 'Проверьте наличие обновлений',
        description: 'Нажмите кнопку ниже, чтобы проверить доступные обновления',
        variant: 'default' as const,
        badge: 'Готово к проверке'
      }
    case 'checking-for-update':
      return {
        icon: Loader2,
        title: 'Проверка обновлений...',
        description: 'Ищем доступные обновления на сервере',
        variant: 'checking' as const,
        badge: 'Проверка',
        animate: true
      }
    case 'update-not-available':
      return {
        icon: CheckCircle2,
        title: 'У вас последняя версия',
        description: 'Обновлений не найдено. Вы используете актуальную версию приложения.',
        variant: 'success' as const,
        badge: 'Актуально'
      }
    case 'update-available':
      return {
        icon: Rocket,
        title: 'Доступно новое обновление',
        description: 'Новая версия готова к загрузке',
        variant: 'info' as const,
        badge: 'Доступно обновление'
      }
    case 'download-progress':
      return {
        icon: Download,
        title: 'Загрузка обновления...',
        description: 'Пожалуйста, не закрывайте приложение',
        variant: 'progress' as const,
        badge: 'Загрузка'
      }
    case 'update-downloaded':
      return {
        icon: Package,
        title: 'Обновление готово к установке',
        description: 'Вы можете установить его сейчас или позже',
        variant: 'ready' as const,
        badge: 'Готово к установке'
      }
    case 'error':
      return {
        icon: AlertCircle,
        title: 'Ошибка обновления',
        description: 'Произошла ошибка при обработке обновления',
        variant: 'error' as const,
        badge: 'Ошибка'
      }
    default:
      return {
        icon: RefreshCw,
        title: 'Неизвестный статус',
        description: '',
        variant: 'default' as const,
        badge: 'Неизвестно'
      }
  }
}

export const UpdateStatusPanel = () => {
  const [
    updateData,
    versionApp,
    handleCheckForUpdate,
    handleRetryDownload,
    handleDownload,
    handleInstallNow,
    handleInstallOnQuit
  ] = useUnit([
    $updateData,
    $versionApp,
    checkForUpdateFx,
    retryDownloadFx,
    downloadUpdateFx,
    installNowUpdateFx,
    InstallOnQuitUpdateFx
  ])

  const config = getStatusConfig(updateData.status)
  const Icon = config.icon

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300',
        config.variant === 'success' && 'border-green-500/50',
        config.variant === 'error' && 'border-destructive/50',
        config.variant === 'ready' && 'border-primary/50'
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                config.variant === 'default' && 'bg-muted',
                config.variant === 'checking' && 'bg-blue-500/10',
                config.variant === 'success' && 'bg-green-500/10',
                config.variant === 'info' && 'bg-blue-500/10',
                config.variant === 'progress' && 'bg-primary/10',
                config.variant === 'ready' && 'bg-primary/10',
                config.variant === 'error' && 'bg-destructive/10'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  config.animate && 'animate-spin',
                  config.variant === 'default' && 'text-muted-foreground',
                  config.variant === 'checking' && 'text-blue-500',
                  config.variant === 'success' && 'text-green-500',
                  config.variant === 'info' && 'text-blue-500',
                  config.variant === 'progress' && 'text-primary',
                  config.variant === 'ready' && 'text-primary',
                  config.variant === 'error' && 'text-destructive'
                )}
              />
            </div>
            <div>
              <CardTitle className="text-xl">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <Badge
            variant={
              config.variant === 'success' || config.variant === 'ready'
                ? 'default'
                : config.variant === 'error'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {config.badge}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Version Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>
              Текущая версия: <strong className="text-foreground">{versionApp || '0.0.1'}</strong>
            </span>
          </div>
          {updateData.status === 'update-available' && (
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span>
                Новая версия: <strong className="text-primary">{updateData.data.version}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Check Button - shown for idle, update-not-available, or checking */}
          {(updateData.status === 'idle' ||
            updateData.status === 'update-not-available' ||
            updateData.status === 'checking-for-update') && (
            <Button
              onClick={() => handleCheckForUpdate()}
              disabled={updateData.status === 'checking-for-update'}
              className="gap-2"
            >
              {updateData.status === 'checking-for-update' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Проверить обновления
                </>
              )}
            </Button>
          )}

          {/* Update Available - Download Button */}
          {updateData.status === 'update-available' && (
            <Button onClick={() => handleDownload()} className="gap-2">
              <Download className="h-4 w-4" />
              Скачать обновление
            </Button>
          )}

          {/* Download Progress */}
          {updateData.status === 'download-progress' && (
            <div className="w-full space-y-2">
              <Progress value={updateData.data.percent} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {formatBytes(updateData.data.transferred)} / {formatBytes(updateData.data.total)}
                </span>
                <span>{formatBytes(updateData.data.bytesPerSecond, true)}/сек</span>
              </div>
            </div>
          )}

          {/* Update Downloaded - Install Buttons */}
          {updateData.status === 'update-downloaded' && (
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button onClick={() => handleInstallNow()} className="flex-1 gap-2">
                <Rocket className="h-4 w-4" />
                Установить сейчас
              </Button>
              <Button variant="outline" onClick={() => handleInstallOnQuit()} className="flex-1 gap-2">
                <Clock className="h-4 w-4" />
                Установить при выходе
              </Button>
            </div>
          )}

          {/* Error - Retry Button */}
          {updateData.status === 'error' && (
            <Button variant="outline" onClick={() => handleRetryDownload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Повторить попытку
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
