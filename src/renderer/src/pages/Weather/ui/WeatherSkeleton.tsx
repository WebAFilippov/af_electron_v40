import { Card, CardContent, CardHeader } from '@/shared/ui'
import type { ReactNode } from 'react'

export const WeatherSkeleton = (): ReactNode => {
  return (
    <div className="space-y-6">
      {/* Main Weather Card Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-32 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-20 w-20 bg-muted rounded-full animate-pulse" />
          </div>

          {/* Details Grid Skeleton */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Chart Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-muted/30 rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* Sun Times Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
