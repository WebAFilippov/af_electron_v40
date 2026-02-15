import { useUnit } from 'effector-react'

import { Input, Spinner } from '@/shared/ui'
import type { Location as CityLocation } from '@/shared_app/api/open-meteo/types'
import { useState, useRef, useCallback, type ReactNode, useEffect } from 'react'
import { useClickOutside } from '@/shared/lib/hooks/use-click-outside'
import { cn } from '@/shared/lib'
import {
  $searchPending,
  $searchQuery,
  $searchResults,
  changeSearchQuery,
  selectLocation
} from '../model/search-location'

export const CitySearch = (): ReactNode => {
  const [query, results, isPending] = useUnit([$searchQuery, $searchResults, $searchPending])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Закрываем список при клике вне
  useClickOutside(containerRef, () => {
    setIsOpen(false)
    setHighlightedIndex(-1)
  })

  // Открываем список когда есть результаты
  useEffect(() => {
    if (results.length > 0 && query.length >= 2) {
      setIsOpen(true)
    } else if (results.length === 0) {
      setIsOpen(false)
    }
  }, [results, query])

  const handleSelect = useCallback((location: CityLocation) => {
    selectLocation(location)
    changeSearchQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    // Возвращаем фокус на инпут
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && results[highlightedIndex]) {
            handleSelect(results[highlightedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    },
    [isOpen, results, highlightedIndex, handleSelect]
  )

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Поиск города..."
          value={query}
          onChange={(e) => changeSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          className="w-full pr-10"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="city-search-listbox"
          aria-expanded={isOpen}
          aria-activedescendant={highlightedIndex >= 0 ? `city-option-${results[highlightedIndex]?.id}` : undefined}
        />

        {isPending && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />}
      </div>

      {isOpen && results.length > 0 && (
        <div
          id="city-search-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[300px] overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {results.map((location: CityLocation, index) => (
            <div
              key={location.id}
              id={`city-option-${location.id}`}
              role="option"
              aria-selected={index === highlightedIndex}
              className={cn(
                'cursor-pointer rounded-sm px-3 py-2 text-sm',
                index === highlightedIndex && 'bg-accent text-accent-foreground',
                'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => handleSelect(location)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{location.name}</span>
                <span className="text-xs text-muted-foreground">
                  {location.admin1 ? `${location.admin1}, ` : ''}
                  {location.country}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isPending && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          Города не найдены
        </div>
      )}
    </div>
  )
}
