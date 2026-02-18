import { Card, CardContent } from '@/shared/ui'
import { Wind, Droplets, Eye, Gauge } from 'lucide-react'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'
import { getWindDirection } from '../utils/getWindDirection'
import type { CurrentWeather } from '@/entities/weather/model/types'
import type { ReactNode } from 'react'

interface WeatherDetailsProps {
  current: CurrentWeather
}

export const WeatherDetails = ({ current }: WeatherDetailsProps): ReactNode => {
  const t = useUnit($t)

  const details = [
    {
      icon: Wind,
      label: t('page.weather.wind'),
      value: t('page.weather.values.wind', {
        value: Math.round(current.wind_speed_10m),
        direction: getWindDirection(current.wind_direction_10m)
      })
    },
    {
      icon: Droplets,
      label: t('page.weather.humidity'),
      value: t('page.weather.values.humidity', { value: current.relative_humidity_2m })
    },
    {
      icon: Eye,
      label: t('page.weather.cloud_cover'),
      value: t('page.weather.values.cloud_cover', { value: current.cloud_cover })
    },
    {
      icon: Gauge,
      label: t('page.weather.pressure'),
      value: t('page.weather.values.pressure', { value: Math.round(current.pressure_msl) })
    }
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <detail.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{detail.label}</p>
                <p className="font-medium">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
