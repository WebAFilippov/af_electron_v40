import { Suspense, lazy } from 'react'
import { useUnit } from 'effector-react'
import { $currentLocation } from '@/entities/location'
import { $weatherPending } from '@/entities/weather'
import { CitySearch } from '@/features/search-location/ui/CitySearch'
import { detectLocationByIP, $ipDetectionPending } from '@/features/detect-location/model/detect-location'
import { Card, CardContent, Button, Spinner } from '@/shared/ui'
import { MapPin, Search, LocateFixed } from 'lucide-react'
import type { ReactNode } from 'react'
import { $t } from '@/entities/i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { MapPinPlus } from '@hugeicons/core-free-icons'

// Lazy loading для погоды
const WeatherDisplay = lazy(() => import('./WeatherDisplay').then((m) => ({ default: m.WeatherDisplay })))

// Компонент выбора локации
const LocationSelector = (): ReactNode => {
  const t = useUnit($t)
  const isDetecting = useUnit($ipDetectionPending)

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25 mb-4">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {t('page.weather.title', 'Погода')}
          </h1>
          <p className="text-muted-foreground">{t('page.weather.subtitle', 'Выберите город для просмотра прогноза')}</p>
        </div>

        {/* Search Card */}
        <Card className="border-2 shadow-xl shadow-black/5">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t('page.weather.search_label', 'Поиск города')}
              </label>
              <CitySearch />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('page.weather.or', 'или')}</span>
              </div>
            </div>

            <Button
              onClick={() => detectLocationByIP()}
              disabled={isDetecting}
              variant="outline"
              className="w-full h-12 cursor-pointer group hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
            >
              {isDetecting ? (
                <>
                  <Spinner className="mr-2" />
                  {t('page.weather.detecting', 'Определение...')}
                </>
              ) : (
                <>
                  <LocateFixed className="mr-2 h-4 w-4 group-hover:text-blue-500 transition-colors" />
                  {t('page.weather.detect_location', 'Определить по IP')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">{t('page.weather.feature_1', 'Автоопределение')}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">{t('page.weather.feature_2', '7 дней прогноз')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fallback для Suspense
const WeatherSkeleton = (): ReactNode => (
  <div className="p-6 animate-pulse">
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Skeleton */}
      <div className="h-16 rounded-2xl bg-muted" />

      {/* Main Weather Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 rounded-3xl bg-gradient-to-br from-muted to-muted/50" />
        <div className="h-96 rounded-3xl bg-muted" />
      </div>

      {/* Details Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  </div>
)

export const WeatherPage = (): ReactNode => {
  const location = useUnit($currentLocation)
  const isPending = useUnit($weatherPending)

  // Если нет локации - показываем выбор
  if (!location) {
    return <LocationSelector />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header с поиском */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <CitySearch />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => detectLocationByIP()}
            className="shrink-0"
            title="Определить по IP"
          >
            <HugeiconsIcon icon={MapPinPlus} />
          </Button>
        </div>
      </header>

      {/* Основной контент с Suspense */}
      <main className="p-4 md:p-6">
        <Suspense fallback={<WeatherSkeleton />}>
          {isPending && !location ? <WeatherSkeleton /> : <WeatherDisplay />}
        </Suspense>
      </main>
    </div>
  )
}
