import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import type { HourlyWeather } from '@/entities/weather/model/types'
import { format } from 'date-fns'
import { Thermometer } from 'lucide-react'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'

interface HourlyTemperatureChartProps {
  hourly: HourlyWeather
}

export function HourlyTemperatureChart({ hourly }: HourlyTemperatureChartProps) {
  const t = useUnit($t)

  const data = useMemo(() => {
    const now = new Date()

    // Находим индекс первого элемента, который >= текущего времени
    const startIndex = hourly.time.findIndex((timeStr) => {
      const itemTime = new Date(timeStr)
      return itemTime >= now
    })

    // Если не нашли (все данные в прошлом), берем с начала
    const actualStartIndex = startIndex === -1 ? 0 : startIndex

    // Берем следующие 24 часа
    const endIndex = Math.min(actualStartIndex + 24, hourly.time.length)

    return hourly.time.slice(actualStartIndex, endIndex).map((time, index) => ({
      time,
      hour: format(new Date(time), 'HH:mm'),
      temperature: Math.round(hourly.temperature_2m[actualStartIndex + index]),
      feelsLike: Math.round(hourly.apparent_temperature[actualStartIndex + index]),
      precipitation: hourly.precipitation[actualStartIndex + index],
      isNow: index === 0
    }))
  }, [hourly])

  const maxTemp = Math.max(...data.map((d) => d.temperature))
  const minTemp = Math.min(...data.map((d) => d.temperature))

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Thermometer className="w-5 h-5 text-primary" />
          {t('page.weather.hourly_chart.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0
              }}
            >
              <defs>
                <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feelsLikeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />

              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={3}
                stroke="rgba(148, 163, 184, 0.5)"
              />

              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
                domain={['dataMin - 2', 'dataMax + 2']}
                stroke="rgba(148, 163, 184, 0.5)"
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <p className="font-semibold mb-2">{label}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-blue-500">
                            {t('page.weather.hourly_chart.temperature')}: {payload[0].value}°
                          </p>
                          <p className="text-orange-500">
                            {t('page.weather.hourly_chart.feels_like')}: {payload[1].value}°
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#temperatureGradient)"
                name={t('page.weather.hourly_chart.temperature')}
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />

              <Area
                type="monotone"
                dataKey="feelsLike"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#feelsLikeGradient)"
                name={t('page.weather.hourly_chart.feels_like')}
                dot={false}
                activeDot={{ r: 4, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Легенда и статистика */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">{t('page.weather.hourly_chart.temperature')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">{t('page.weather.hourly_chart.feels_like')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <span className="text-muted-foreground">{t('page.weather.high')}: </span>
              <span className="font-semibold text-blue-500">{maxTemp}°</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">{t('page.weather.low')}: </span>
              <span className="font-semibold text-blue-500">{minTemp}°</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
