import { useUnit } from 'effector-react'
import {
  changeSearchQuery,
  $searchQuery,
  $searchResults,
  $searchPending,
  selectLocation
} from '@/features/search-location/model'
import { Input, Button } from '@/shared/ui'
import type { Location } from '@/shared_app/api/open-meteo/types'
import type { ReactNode } from 'react'

export const CitySearch = (): ReactNode => {
  const [query, results, isPending] = useUnit([$searchQuery, $searchResults, $searchPending])

  const handleSelect = (location: Location) => {
    selectLocation(location)
    changeSearchQuery('')
  }

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder="Search city..."
        value={query}
        onChange={(e) => changeSearchQuery(e.target.value)}
        className="w-full"
      />

      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
          {results.map((location) => (
            <Button
              key={location.id}
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-left hover:bg-accent"
              onClick={() => handleSelect(location)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{location.name}</span>
                <span className="text-xs text-muted-foreground">
                  {location.admin1 ? `${location.admin1}, ` : ''}
                  {location.country}
                </span>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
