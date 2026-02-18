import { Card, CardContent } from '@/shared/ui'
import { CitySearch } from '@/features/search-location/ui/CitySearch'
import { DetectLocation } from '@/features/detect-location/ui/DetectCity'
import type { ReactNode } from 'react'

export const SearchCard = (): ReactNode => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <CitySearch />
          </div>
          <DetectLocation />
        </div>
      </CardContent>
    </Card>
  )
}
