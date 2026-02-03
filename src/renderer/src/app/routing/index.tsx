import type { RouteObject } from 'react-router'
import { createHashRouter, Outlet } from 'react-router'
import { BaseLayout } from '../layouts/base-layout'

import { NotFound404Page } from '@/pages/NotFound404'
import { HomePage } from '@/pages/Home'
import { UpdatePage } from '@/pages/Updates'
import { SettingsPage } from '@/pages/Settings'
import { WeatherPage } from '@/pages/Weather'

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
    errorElement: <div>error page</div>,
    children: [
      {
        index: true,
        element: <HomePage />,
        handle: { breadcrumb: () => 'breadcrumb.home' }
      },
      {
        path: 'settings',
        element: <Outlet />,
        handle: { breadcrumb: () => 'breadcrumb.settings' },
        children: [
          {
            index: true,
            element: <SettingsPage />
          }
        ]
      },
      {
        path: 'update',
        element: <UpdatePage />,
        handle: { breadcrumb: () => 'breadcrumb.update' }
      },
      {
        path: 'weather',
        element: <WeatherPage />,
        handle: { breadcrumb: () => 'breadcrumb.weather' }
      },
      {
        path: '*',
        element: <NotFound404Page />,
        handle: { breadcrumb: () => 'breadcrumb.404' }
      }
    ]
  }
]

export const router = createHashRouter(routes, {
  basename: window.location.hash.slice(1).split('?')[0]
})
