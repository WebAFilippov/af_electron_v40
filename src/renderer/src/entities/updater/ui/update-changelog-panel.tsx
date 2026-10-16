import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { format, isValid, parseISO } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { Calendar, ExternalLink, GitCommitHorizontal, Loader2 } from 'lucide-react'

import { $language, $t } from '@/entities/i18next'
import { ReleaseProps } from '@/shared_app/types'
import { Badge, Button, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, ScrollArea, Separator } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { $releases, $releasesPending, $versionApp, loadReleasesFx } from '../model/model-updater'

const DATE_LOCALES = { ru, en: enUS } as const

const formatReleaseDate = (publishedAt: string, locale: keyof typeof DATE_LOCALES): string => {
  const date = parseISO(publishedAt)
  if (!isValid(date)) return publishedAt
  return format(date, 'd MMMM yyyy', { locale: DATE_LOCALES[locale] })
}

/** Splits GitHub release markdown into readable bullet lines. */
const toBulletLines = (notes: string): string[] =>
  notes
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^-{3,}$/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^#{1,6}\s+/, ''))
    .filter(Boolean)

export const UpdateChangelogPanel = (): ReactNode => {
  const t = useUnit($t)
  const language = useUnit($language)
  const [releases, isPending, currentVersion, handleReload] = useUnit([
    $releases,
    $releasesPending,
    $versionApp,
    loadReleasesFx
  ])

  const locale = language === 'en' ? 'en' : 'ru'

  if (isPending && releases.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('page.updates.history_loading')}
      </div>
    )
  }

  if (releases.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GitCommitHorizontal />
          </EmptyMedia>
          <EmptyTitle>{t('page.updates.history_empty_title')}</EmptyTitle>
          <EmptyDescription>{t('page.updates.history_empty_description')}</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" size="sm" onClick={() => handleReload()}>
          {t('page.updates.history_reload')}
        </Button>
      </Empty>
    )
  }

  return (
    <ScrollArea className="h-100 pr-4">
      <ol className="relative space-y-4">
        {releases.map((release: ReleaseProps, index) => {
          const isCurrent = Boolean(currentVersion) && release.version === currentVersion
          const lines = release.notes ? toBulletLines(release.notes) : []

          return (
            <li key={release.id}>
              <div
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  isCurrent ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold leading-none">{release.name || `v${release.version}`}</span>
                    <Badge variant={isCurrent ? 'default' : 'outline'} className="text-xs">
                      {release.version}
                    </Badge>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        {t('page.updates.history_current')}
                      </Badge>
                    )}
                    {release.isPrerelease && (
                      <Badge variant="outline" className="text-xs">
                        {t('page.updates.history_prerelease')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatReleaseDate(release.publishedAt, locale)}
                  </div>
                </div>

                {lines.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <ul className="space-y-1.5">
                      {lines.map((line, lineIndex) => (
                        <li key={lineIndex} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                          <span className="break-words">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-3 flex justify-end">
                  <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                    <a href={release.htmlUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t('page.updates.history_open_release')}
                    </a>
                  </Button>
                </div>
              </div>

              {index < releases.length - 1 && <div className="h-4" />}
            </li>
          )
        })}
      </ol>
    </ScrollArea>
  )
}
