import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { createHashRouter, Outlet } from 'react-router'
import { BaseLayout } from '../layouts/base-layout'
import { Spinner } from '@/shared/ui'
import { ErrorPage } from '@/pages/Error'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })))
const SettingsPage = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.SettingsPage })))
const UpdatePage = lazy(() => import('@/pages/Updates').then((m) => ({ default: m.UpdatePage })))
const WeatherPage = lazy(() => import('@/pages/Weather').then((m) => ({ default: m.WeatherPage })))
const NotFound404Page = lazy(() => import('@/pages/NotFound404').then((m) => ({ default: m.NotFound404Page })))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner className="w-8 h-8" />
  </div>
)

// Wrapper with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

export type RouteHandle = {
  breadcrumb?: () => string
}

export type AppRouteObject = RouteObject & {
  handle?: RouteHandle
}

const routes: AppRouteObject[] = [
  {
    path: '/',
    element: <BaseLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
        handle: { breadcrumb: () => 'breadcrumb.home' }
      },
      {
        path: 'settings',
        element: <Outlet />,
        handle: { breadcrumb: () => 'breadcrumb.settings' },
        children: [
          {
            index: true,
            element: withSuspense(SettingsPage)
          }
        ]
      },
      {
        path: 'update',
        element: withSuspense(UpdatePage),
        handle: { breadcrumb: () => 'breadcrumb.update' }
      },
      {
        path: 'weather',
        element: withSuspense(WeatherPage),
        handle: { breadcrumb: () => 'breadcrumb.weather' }
      },
      {
        path: '*',
        element: withSuspense(NotFound404Page),
        handle: { breadcrumb: () => 'breadcrumb.404' }
      }
    ]
  }
]

export const router = createHashRouter(routes, {
  basename: window.location.hash.slice(1).split('?')[0]
})
