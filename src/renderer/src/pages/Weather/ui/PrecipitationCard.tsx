import { Card, CardContent } from '@/shared/ui'
import { CloudRain } from 'lucide-react'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'
import type { CurrentWeather } from '@/entities/weather/model/types'
import type { ReactNode } from 'react'

interface PrecipitationCardProps {
  current: CurrentWeather
}

export const PrecipitationCard = ({ current }: PrecipitationCardProps): ReactNode | null => {
  const t = useUnit($t)

  const hasPrecipitation = current.precipitation > 0 || current.rain > 0 || current.snowfall > 0

  if (!hasPrecipitation) return null

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
            <CloudRain className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('page.weather.precipitation')}</p>
            <p className="text-xl font-bold">
              {current.precipitation > 0 &&
                t('page.weather.values.precipitation', { value: current.precipitation }) + ' '}
              {current.rain > 0 && t('page.weather.rain') + ' '}
              {current.snowfall > 0 && t('page.weather.snow')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
