import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

interface UsageBarProps {
  value: number
  /** Optional secondary value drawn behind the main one (e.g. cached memory). */
  secondaryValue?: number
  className?: string
  /** Colour tone; defaults to a neutral primary accent. */
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const TONE_CLASSES: Record<NonNullable<UsageBarProps['tone']>, string> = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-destructive'
}

/** Picks a tone from a 0..100 percentage so hot values stand out. */
export const toneForUsage = (percent: number): NonNullable<UsageBarProps['tone']> => {
  if (percent >= 90) return 'danger'
  if (percent >= 75) return 'warning'
  if (percent >= 50) return 'default'
  return 'success'
}

export const UsageBar = ({ value, secondaryValue, className, tone = 'default' }: UsageBarProps): ReactNode => {
  const primary = Math.min(100, Math.max(0, value))
  const secondary = secondaryValue === undefined ? 0 : Math.min(100, Math.max(0, secondaryValue))

  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      {secondary > 0 && (
        <div className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/25" style={{ width: `${secondary}%` }} />
      )}
      <div
        className={cn('absolute inset-y-0 left-0 rounded-full transition-[width] duration-500', TONE_CLASSES[tone])}
        style={{ width: `${primary}%` }}
      />
    </div>
  )
}
