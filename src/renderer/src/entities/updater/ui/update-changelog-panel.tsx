import { $updateData } from '../model/model-updater'
import { useUnit } from 'effector-react'
import { ScrollArea, Badge, Separator } from '@/shared/ui'
import { Calendar, Tag, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ReleaseNoteInfo {
  version: string
  note: string | null
}

const parseReleaseNotes = (notes: string | ReleaseNoteInfo[] | null | undefined): ReleaseNoteInfo[] => {
  if (!notes) return []

  if (typeof notes === 'string') {
    // Parse markdown-style release notes
    return [{ version: 'Текущее', note: notes }]
  }

  return notes
}

const formatReleaseDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Дата неизвестна'

  try {
    const date = new Date(dateStr)
    return format(date, 'dd MMMM yyyy', { locale: ru })
  } catch {
    return dateStr
  }
}

export const UpdateChangelogPanel = () => {
  const updateData = useUnit($updateData)

  // Get release notes from current update data if available
  const releaseNotes =
    updateData.status === 'update-available' || updateData.status === 'update-downloaded'
      ? updateData.data?.releaseNotes
      : null

  const releaseName =
    updateData.status === 'update-available' || updateData.status === 'update-downloaded'
      ? updateData.data?.releaseName
      : null

  const releaseDate =
    updateData.status === 'update-available' || updateData.status === 'update-downloaded'
      ? updateData.data?.releaseDate
      : null

  const version =
    updateData.status === 'update-available' || updateData.status === 'update-downloaded'
      ? updateData.data?.version
      : null

  const parsedNotes = parseReleaseNotes(releaseNotes)

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-6">
        {/* New Update Info */}
        {(version || parsedNotes.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1">
                <Tag className="h-3 w-3" />
                Новое обновление
              </Badge>
            </div>

            {version && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Версия:</span>
                <span className="text-primary font-semibold">{version}</span>
              </div>
            )}

            {releaseName && <div className="text-sm text-muted-foreground">{releaseName}</div>}

            {releaseDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatReleaseDate(releaseDate)}
              </div>
            )}

            <Separator />

            {/* Release Notes */}
            {parsedNotes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Что нового:
                </div>

                {parsedNotes.map((note, index) => (
                  <div key={index} className="space-y-2">
                    {note.version !== 'Текущее' && (
                      <div className="text-sm font-medium text-primary">Версия {note.version}</div>
                    )}
                    {note.note && (
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap pl-3 border-l-2 border-primary/30">
                        {note.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No updates info */}
        {!version && !parsedNotes.length && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>История изменений будет доступна после проверки обновлений</p>
            <p className="text-sm mt-1">Нажмите "Проверить обновления" чтобы увидеть список изменений</p>
          </div>
        )}

        {/* Version History Placeholder */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">История версий</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="text-xs font-medium text-primary">Тек</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Текущая версия</span>
                  <Badge variant="outline" className="text-xs">
                    0.0.1
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Текущая установленная версия приложения</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground pl-11">
              История предыдущих версий будет отображаться здесь после обновления
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
