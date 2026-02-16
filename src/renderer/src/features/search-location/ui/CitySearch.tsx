import { useState } from 'react'
import { useUnit } from 'effector-react'
import { ChevronsUpDown, MapPin } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

import { $searchPending, $searchQuery, $searchResults, changeSearchQuery } from '../model/search-location'
import { $currentLocation, selectLocation } from '@/entities/location'
import { $t } from '@/entities/i18next'
import { Spinner } from '@/shared/ui'

export const CitySearch = () => {
  const [open, setOpen] = useState(false)
  const t = useUnit($t)
  const [query, results, isPending, setSearchQuery] = useUnit([
    $searchQuery,
    $searchResults,
    $searchPending,
    changeSearchQuery
  ])
  const [setLocation, location] = useUnit([selectLocation, $currentLocation])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between items-center relative"
        >
          <span className="truncate">{location?.city || t('features.search-location.btn-search-cities')}</span>
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="center">
        <Command loop>
          <CommandInput
            placeholder={t('features.search-location.command-input-placeholder')}
            value={query}
            onValueChange={(e) => setSearchQuery(e)}
          />
          <CommandList>
            {isPending ? (
              <div className="py-6 text-sm flex justify-center items-center gap-2">
                <Spinner />
                {t('features.search-location.command-pending')}
              </div>
            ) : (
              <>
                <CommandEmpty>{t('features.search-location.command-not-found')}</CommandEmpty>
                <CommandGroup>
                  {results.map((location) => (
                    <CommandItem
                      key={location.id}
                      value={`${location.city}-${location.id}`}
                      onSelect={() => {
                        setLocation(location)
                        setOpen(false)
                      }}
                      className="cursor-pointer flex justify-start items-center"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{location.city}</span>
                        <span className="text-xs text-muted-foreground">
                          {location.region && `${location.region}, `}
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
