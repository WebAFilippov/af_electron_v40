import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { MapPin } from 'lucide-react'

import { $currentLocation } from '@/entities/location'
import { $t } from '@/entities/i18next'
import { CitySearch } from '@/features/search-location/ui/CitySearch'
import { DetectLocation } from '@/features/detect-location/ui/DetectCity'
import { Card, CardContent } from '@/shared/ui'

/**
 * City picker.
 *
 * Always visible on the weather page rather than behind a menu: the chosen city
 * decides what the whole page shows, so switching it should be one obvious step. The
 * current city is spelled out next to the search field so there is no doubt about
 * which place the numbers below belong to.
 */
export const SearchCard = (): ReactNode => {
  const t = useUnit($t)
  const location = useUnit($currentLocation)

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            {location ? (
              <span>
                <span className="font-medium">{location.city}</span>
                <span className="text-muted-foreground">
                  {location.region ? `, ${location.region}` : ''}
                  {location.country ? `, ${location.country}` : ''}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">{t('page.weather.city_not_selected')}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <CitySearch />
          </div>
          <DetectLocation className="shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
