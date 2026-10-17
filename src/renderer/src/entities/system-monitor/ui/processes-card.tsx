import type { ReactNode } from 'react'
import { useState } from 'react'
import { useUnit } from 'effector-react'
import { AlertTriangle, Cpu, HardDrive, Search, Skull, X } from 'lucide-react'

import { $t } from '@/entities/i18next'
import type { MonitorProcessInfo } from '@/shared_app/types'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input
} from '@/shared/ui'
import { cn } from '@/shared/lib'
import { $snapshot, terminateProcessFx } from '../model/monitor'
import { formatBytes } from '../utils/format'
import { UsageBar, toneForUsage } from './usage-bar'

type SortKey = 'cpu' | 'memory' | 'name'
type SortDirection = 'asc' | 'desc'

/** Colour-codes CPU so a hot process stands out in a long list. */
const cpuTone = (percent: number): string => {
  if (percent >= 50) return 'text-destructive'
  if (percent >= 20) return 'text-amber-600 dark:text-amber-500'
  if (percent >= 5) return 'text-primary'
  return 'text-muted-foreground'
}

export const ProcessesCard = (): ReactNode => {
  const t = useUnit($t)
  const [snapshot, handleTerminate, isTerminating] = useUnit([
    $snapshot,
    terminateProcessFx,
    terminateProcessFx.pending
  ])

  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('cpu')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [pendingKill, setPendingKill] = useState<MonitorProcessInfo | null>(null)

  if (snapshot === null) {
    return null
  }

  const processes = snapshot.processes

  const toggleSort = (key: SortKey): void => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDirection(key === 'name' ? 'asc' : 'desc')
  }

  const filtered = query.trim()
    ? processes.filter((process) => {
        const needle = query.trim().toLowerCase()
        return (
          process.name.toLowerCase().includes(needle) ||
          process.description.toLowerCase().includes(needle) ||
          String(process.pid).includes(needle)
        )
      })
    : processes

  const sorted = [...filtered].sort((a, b) => {
    const factor = sortDirection === 'asc' ? 1 : -1

    switch (sortKey) {
      case 'name':
        return a.name.localeCompare(b.name) * factor
      case 'memory':
        return (a.workingSet - b.workingSet) * factor
      case 'cpu':
      default:
        return (a.cpuPercent - b.cpuPercent) * factor
    }
  })

  const totalMemory = processes.reduce((sum, process) => sum + process.workingSet, 0)
  const totalPercent = snapshot.memory.loadPercent

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-base">{t('page.monitor.processes_title')}</CardTitle>
                <CardDescription>
                  {t('page.monitor.processes_count', { count: processes.length })} ·{' '}
                  {t('page.monitor.processes_memory', { value: formatBytes(totalMemory) })}
                </CardDescription>
              </div>
            </div>

            <div className="relative w-full max-w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('page.monitor.processes_search')}
                className="h-9 pl-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={t('page.monitor.processes_clear')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Header row doubles as the sort control. */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b pb-2 text-xs font-medium text-muted-foreground">
            <button type="button" className="text-left hover:text-foreground" onClick={() => toggleSort('name')}>
              {t('page.monitor.processes_column_name')}
              {sortKey === 'name' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </button>
            <button
              type="button"
              className="w-16 text-right hover:text-foreground"
              onClick={() => toggleSort('cpu')}
            >
              {t('page.monitor.processes_column_cpu')}
              {sortKey === 'cpu' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </button>
            <button
              type="button"
              className="w-20 text-right hover:text-foreground"
              onClick={() => toggleSort('memory')}
            >
              {t('page.monitor.processes_column_memory')}
              {sortKey === 'memory' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </button>
            <span className="w-8" />
          </div>

          <div className="max-h-100 space-y-0.5 overflow-y-auto pr-1">
            {sorted.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t('page.monitor.processes_empty')}
              </div>
            )}

            {sorted.map((process) => (
              <div
                key={process.pid}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded px-1 py-1.5 text-sm hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{process.description || process.name}</span>
                    {process.isProtected && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] leading-4">
                        {t('page.monitor.processes_system')}
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {process.name} · PID {process.pid}
                    {process.company ? ` · ${process.company}` : ''}
                  </div>
                </div>

                <div className={cn('w-16 text-right tabular-nums', cpuTone(process.cpuPercent))}>
                  {process.cpuPercent.toFixed(1)}%
                </div>

                <div className="w-20 text-right tabular-nums text-muted-foreground">
                  {formatBytes(process.workingSet)}
                </div>

                <div className="w-8">
                  {process.canTerminate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label={t('page.monitor.processes_terminate')}
                      disabled={isTerminating}
                      onClick={() => setPendingKill(process)}
                    >
                      <Skull className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Memory context: how much of RAM the listed processes account for. */}
          <div className="flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" />
            <span className="flex-1">{t('page.monitor.processes_memory_share')}</span>
            <div className="w-32">
              <UsageBar value={totalPercent} tone={toneForUsage(totalPercent)} />
            </div>
            <span className="tabular-nums">{totalPercent.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation is mandatory: terminating a process is destructive and
          cannot be undone. */}
      <Dialog open={pendingKill !== null} onOpenChange={(open) => !open && setPendingKill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('page.monitor.processes_confirm_title')}
            </DialogTitle>
            <DialogDescription>
              {t('page.monitor.processes_confirm_description', {
                name: pendingKill?.description || pendingKill?.name || '',
                pid: pendingKill?.pid ?? 0
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            {t('page.monitor.processes_confirm_warning')}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingKill(null)}>
              {t('page.monitor.processes_confirm_cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={isTerminating}
              onClick={() => {
                if (pendingKill !== null) {
                  handleTerminate(pendingKill.pid)
                }
                setPendingKill(null)
              }}
            >
              {t('page.monitor.processes_confirm_kill')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
