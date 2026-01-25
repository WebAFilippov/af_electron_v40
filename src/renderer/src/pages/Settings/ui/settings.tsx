import { AutoLaunch } from '@/entities/auto-launch'
import { AutoStartMinimaze } from '@/entities/auto-start-minimazed'
import { LanguageSwitcher } from '@/entities/i18next'

import { ThemeSwitcher } from '@/entities/theme'
import { Button } from '@/shared/ui'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

export const SettingsPage = (): ReactNode => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast('Event has been created')}>
          Default 0123456789 @ / * & ? ^ $ #
        </Button>
        <Button variant="outline" onClick={() => toast.success('Event has been created')}>
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info('Be at the area 10 minutes before the event time')}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning('Event start time cannot be earlier than 8am')}
        >
          Warning
        </Button>
        <Button variant="outline" onClick={() => toast.error('Event has not been created')}>
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.promise<{ name: string }>(
              () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Event' }), 2000)),
              {
                loading: 'Loading...',
                success: (data) => `${data.name} has been created`,
                error: 'Error'
              }
            )
          }}
        >
          Promise
        </Button>
      </div>
      <LanguageSwitcher />
      <ThemeSwitcher />
      <AutoLaunch />
      <AutoStartMinimaze />
    </div>
  )
}
