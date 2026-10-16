import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { AlertTriangle, Download, ExternalLink, Loader2, Play, ThermometerSun } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Badge, Button, Card, CardContent } from '@/shared/ui'
import {
  $isSensorActionPending,
  $sensorActionMessage,
  $sensorStatus,
  installSensorsFx,
  launchSensorsFx,
  openSensorsSiteFx
} from '../model/monitor'

/**
 * Explains how to enable temperature readings.
 *
 * LibreHardwareMonitor is manifested `requireAdministrator` because it loads a
 * kernel driver, so Windows always shows a UAC prompt. The card therefore offers
 * an explicit install/launch action rather than pretending the step can be
 * skipped, and it stays out of the way once the provider is running.
 */
export const SensorsProviderCard = (): ReactNode => {
  const t = useUnit($t)
  const [status, isPending, actionMessage, handleInstall, handleLaunch, handleOpenSite] = useUnit([
    $sensorStatus,
    $isSensorActionPending,
    $sensorActionMessage,
    installSensorsFx,
    launchSensorsFx,
    openSensorsSiteFx
  ])

  // Nothing to explain when temperatures already work.
  if (status.active) {
    return null
  }

  const isUnsupported = status.state === 'unsupported'

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <ThermometerSun className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{t('page.monitor.sensors_title')}</span>
              <Badge variant={status.installed ? 'secondary' : 'outline'} className="text-xs">
                {status.installed ? t('page.monitor.sensors_state_installed') : t('page.monitor.sensors_state_missing')}
              </Badge>
            </div>

            <p className="max-w-2xl text-sm text-muted-foreground">{t('page.monitor.sensors_description')}</p>

            {/* The UAC requirement is a hard Windows constraint, so it is stated
                up front instead of surprising the user with a prompt. */}
            <p className="max-w-2xl text-xs text-muted-foreground">{t('page.monitor.sensors_uac_hint')}</p>

            {actionMessage !== null && (
              <div className="flex items-start gap-2 pt-1 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="break-all">{actionMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!isUnsupported &&
            (status.installed ? (
              <Button size="sm" className="gap-2" disabled={isPending} onClick={() => handleLaunch()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {t('page.monitor.sensors_launch')}
              </Button>
            ) : status.wingetAvailable ? (
              <Button size="sm" className="gap-2" disabled={isPending} onClick={() => handleInstall()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t('page.monitor.sensors_install')}
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="gap-2" onClick={() => handleOpenSite()}>
                <ExternalLink className="h-4 w-4" />
                {t('page.monitor.sensors_download')}
              </Button>
            ))}

          {status.installed && status.wingetAvailable && (
            <Button size="sm" variant="outline" className="gap-2" onClick={() => handleOpenSite()}>
              <ExternalLink className="h-4 w-4" />
              {t('page.monitor.sensors_site')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
