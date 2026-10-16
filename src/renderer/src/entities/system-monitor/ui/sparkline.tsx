import type { ReactNode } from 'react'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'

import { cn } from '@/shared/lib'

interface SparklineProps {
  /** Series values; the newest sample is expected last. */
  data: number[]
  className?: string
  /** Fixes the top of the scale (e.g. 100 for percentages). */
  max?: number
  tone?: 'primary' | 'green' | 'amber' | 'destructive'
}

const TONE_STROKE: Record<NonNullable<SparklineProps['tone']>, string> = {
  primary: 'var(--primary)',
  green: '#22c55e',
  amber: '#f59e0b',
  destructive: 'var(--destructive)'
}

/**
 * Compact area chart used inside metric cards. Values are mapped into objects
 * because recharts requires a keyed data array.
 */
export const Sparkline = ({ data, className, max, tone = 'primary' }: SparklineProps): ReactNode => {
  if (data.length < 2) {
    return <div className={cn('h-12 w-full', className)} />
  }

  const points = data.map((value, index) => ({ index, value }))
  const gradientId = `spark-${tone}`

  return (
    <div className={cn('h-12 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TONE_STROKE[tone]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={TONE_STROKE[tone]} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* A fixed domain keeps the chart from rescaling on every sample, which
              would make small fluctuations look dramatic. */}
          <YAxis hide domain={max === undefined ? ['auto', 'auto'] : [0, max]} />

          <Area
            type="monotone"
            dataKey="value"
            stroke={TONE_STROKE[tone]}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
