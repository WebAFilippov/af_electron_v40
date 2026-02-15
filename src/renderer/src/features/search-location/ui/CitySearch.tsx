import { useState } from 'react'
import { useUnit } from 'effector-react'
import { ChevronsUpDown, MapPin } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

import {
  $searchPending,
  $searchQuery,
  $searchResults,
  changeSearchQuery,
  selectLocation
} from '../model/search-location'
import type { Location } from '@/shared_app/api/open-meteo/types'

export function CitySearch() {
  const [open, setOpen] = useState(false)
  const [query, results, isPending] = useUnit([$searchQuery, $searchResults, $searchPending])

  const handleSelect = (location: Location) => {
    selectLocation(location)
    changeSearchQuery('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between relative">
          <span className="truncate">{query || 'Поиск города...'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[300px]" align="start">
        <Command>
          <CommandInput placeholder="Введите название города..." value={query} onValueChange={changeSearchQuery} />
          <CommandList>
            {isPending ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Поиск...</div>
            ) : (
              <>
                <CommandEmpty>Города не найдены</CommandEmpty>
                <CommandGroup>
                  {results.map((location) => (
                    <CommandItem
                      key={location.id}
                      value={`${location.name}-${location.id}`}
                      onSelect={() => handleSelect(location)}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {location.admin1 ? `${location.admin1}, ` : ''}
                          {location.country}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
