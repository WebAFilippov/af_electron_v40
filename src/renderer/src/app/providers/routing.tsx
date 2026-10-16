import { ComponentType, lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { createHashRouter, Outlet } from 'react-router'
import { BaseLayout } from '../layouts/base-layout'
import { ErrorPage } from '@/pages/Error'
import { FallbackPageLoader } from '@/shared/ui'

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })))
const SettingsPage = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.SettingsPage })))
const UpdatePage = lazy(() => import('@/pages/Updates').then((m) => ({ default: m.UpdatePage })))
const WeatherPage = lazy(() => import('@/pages/Weather').then((m) => ({ default: m.WeatherPage })))
const MonitorPage = lazy(() => import('@/pages/Monitor').then((m) => ({ default: m.MonitorPage })))
const NotFound404Page = lazy(() => import('@/pages/NotFound404').then((m) => ({ default: m.NotFound404Page })))

const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={<FallbackPageLoader />}>
    <Component />
  </Suspense>
)

export type RouteHandle = {
  breadcrumb?: () => string
}

type AppRouteObject = RouteObject & {
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
        path: 'monitor',
        element: withSuspense(MonitorPage),
        handle: { breadcrumb: () => 'breadcrumb.monitor' }
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
