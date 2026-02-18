import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { Sunrise, Sunset } from 'lucide-react'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'
import { formatTime } from '../utils/formatTime'
import type { DailyWeather } from '@/entities/weather/model/types'
import type { ReactNode } from 'react'

interface SunTimesCardProps {
  daily: DailyWeather
}

export const SunTimesCard = ({ daily }: SunTimesCardProps): ReactNode => {
  const t = useUnit($t)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('page.weather.sun_moon')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sunrise className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('page.weather.sunrise')}</p>
              <p className="text-xl font-bold">{formatTime(daily.sunrise[0])}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Sunset className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('page.weather.sunset')}</p>
              <p className="text-xl font-bold">{formatTime(daily.sunset[0])}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
