import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Clock, Info, MonitorCog } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { formatUptime } from '../utils/format'
import { $snapshot } from '../model/monitor'

interface InfoRowProps {
  label: string
  value: ReactNode
}

const InfoRow = ({ label, value }: InfoRowProps): ReactNode => (
  <div className="flex items-baseline justify-between gap-4 py-1 text-sm">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
)

export const SystemCard = (): ReactNode => {
  const t = useUnit($t)
  const snapshot = useUnit($snapshot)

  if (snapshot === null) {
    return null
  }

  const { system } = snapshot
  if (!system.available) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MonitorCog className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base">{t('page.monitor.system_title')}</CardTitle>
              <p className="text-xs text-muted-foreground">{system.hostname}</p>
            </div>
          </div>

          {/* The addon reports elevation so the UI can explain which metrics are
              unavailable rather than leaving the user guessing. */}
          <Badge variant={system.isAdmin ? 'default' : 'secondary'} className="text-xs">
            {system.isAdmin ? t('page.monitor.system_admin') : t('page.monitor.system_user')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="divide-y">
        <div className="pb-2">
          <InfoRow label={t('page.monitor.system_os')} value={system.osVersion || system.osName} />
          <InfoRow label={t('page.monitor.system_arch')} value={system.architecture} />
          <InfoRow
            label={t('page.monitor.system_uptime')}
            value={
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {formatUptime(system.uptimeSeconds)}
              </span>
            }
          />
        </div>

        <div className="pt-2">
          <InfoRow
            label={t('page.monitor.system_board')}
            value={[system.manufacturer, system.model].filter(Boolean).join(' · ') || '—'}
          />
          <InfoRow label={t('page.monitor.system_bios')} value={system.biosVersion || '—'} />
          {system.biosDate && <InfoRow label={t('page.monitor.system_bios_date')} value={system.biosDate} />}
        </div>

        {!system.isAdmin && (
          <div className="flex items-start gap-2 pt-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{t('page.monitor.system_admin_hint')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
