import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useUnit } from 'effector-react'
import { Globe, Lock, Network, Search, X } from 'lucide-react'

import { $t } from '@/entities/i18next'
import type { MonitorConnectionInfo, MonitorProcessInfo } from '@/shared_app/types'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { $snapshot } from '../model/monitor'

type FilterMode = 'all' | 'established' | 'listening'

interface ConnectionRow extends MonitorConnectionInfo {
  /** Resolved from the owning PID; falls back to the raw PID. */
  processName: string
  /** False when the port is bound to loopback only and cannot be reached remotely. */
  isLocalOnly: boolean
}

/** Loopback and unspecified addresses behave very differently from routable ones. */
const isLoopback = (address: string): boolean =>
  address.startsWith('127.') || address === '::1' || address === '0.0.0.0' || address === '::'

const stateTone = (state: string): 'default' | 'secondary' | 'outline' => {
  if (state === 'established') return 'default'
  if (state === 'listening') return 'secondary'
  return 'outline'
}

export const ConnectionsCard = (): ReactNode => {
  const t = useUnit($t)
  const snapshot = useUnit($snapshot)

  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<FilterMode>('all')

  const connections = snapshot?.connections ?? []
  const processes = snapshot?.processes ?? []

  // Resolving the process name once per snapshot keeps the render loop cheap
  // even with a few hundred sockets.
  const processNames = useMemo(() => {
    const map = new Map<number, MonitorProcessInfo>()
    for (const process of processes) {
      map.set(process.pid, process)
    }
    return map
  }, [processes])

  const rows = useMemo<ConnectionRow[]>(() => {
    return connections.map((connection) => {
      const owner = processNames.get(connection.pid)
      return {
        ...connection,
        processName: owner ? owner.description || owner.name : connection.pid === 0 ? '—' : `PID ${connection.pid}`,
        isLocalOnly: isLoopback(connection.localAddress)
      }
    })
  }, [connections, processNames])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return rows.filter((row) => {
      if (mode === 'established' && row.state !== 'established') return false
      if (mode === 'listening' && row.state !== 'listening') return false

      if (!needle) return true

      return (
        row.processName.toLowerCase().includes(needle) ||
        row.localAddress.includes(needle) ||
        row.remoteAddress.includes(needle) ||
        String(row.localPort).includes(needle) ||
        String(row.remotePort).includes(needle)
      )
    })
  }, [rows, query, mode])

  const counts = useMemo(() => {
    let established = 0
    let listening = 0
    for (const row of rows) {
      if (row.state === 'established') established += 1
      if (row.state === 'listening') listening += 1
    }
    return { total: rows.length, established, listening }
  }, [rows])

  if (snapshot === null) {
    return null
  }

  const FILTERS: { mode: FilterMode; label: string; count: number }[] = [
    { mode: 'all', label: t('page.monitor.connections_filter_all'), count: counts.total },
    { mode: 'established', label: t('page.monitor.connections_filter_established'), count: counts.established },
    { mode: 'listening', label: t('page.monitor.connections_filter_listening'), count: counts.listening }
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base">{t('page.monitor.connections_title')}</CardTitle>
              <CardDescription>
                {t('page.monitor.connections_count', { count: counts.total })} ·{' '}
                {t('page.monitor.connections_established', { count: counts.established })}
              </CardDescription>
            </div>
          </div>

          <div className="relative w-full max-w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('page.monitor.connections_search')}
              className="h-9 pl-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t('page.monitor.connections_clear')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.mode}
              type="button"
              onClick={() => setMode(filter.mode)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                mode === filter.mode
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 border-b pb-2 text-xs font-medium text-muted-foreground">
          <span className="w-10">{t('page.monitor.connections_column_proto')}</span>
          <span>{t('page.monitor.connections_column_local')}</span>
          <span>{t('page.monitor.connections_column_remote')}</span>
          <span className="w-32">{t('page.monitor.connections_column_process')}</span>
        </div>

        <div className="max-h-100 space-y-0.5 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('page.monitor.connections_empty')}
            </div>
          )}

          {filtered.map((row, index) => (
            // A socket has no single unique id in the table, so the tuple is used.
            <div
              key={`${row.protocol}-${row.family}-${row.localPort}-${row.remoteAddress}-${row.remotePort}-${row.pid}-${index}`}
              className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 rounded px-1 py-1.5 text-sm hover:bg-muted/50"
            >
              <div className="flex w-10 items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">{row.protocol}</span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                {row.isLocalOnly && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}
                <span className="truncate tabular-nums">
                  {row.localAddress}:{row.localPort}
                </span>
              </div>

              <div className="truncate tabular-nums text-muted-foreground">
                {row.remoteAddress ? `${row.remoteAddress}:${row.remotePort}` : '—'}
              </div>

              <div className="flex w-32 items-center gap-2">
                <Badge variant={stateTone(row.state)} className="shrink-0 text-[10px] leading-4">
                  {t(`page.monitor.connection_state_${row.state.replace(/-/g, '_')}`, {
                    defaultValue: row.state
                  })}
                </Badge>
                <span className="truncate text-xs text-muted-foreground" title={row.processName}>
                  {row.processName}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 border-t pt-3 text-xs text-muted-foreground">
          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t('page.monitor.connections_hint')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
