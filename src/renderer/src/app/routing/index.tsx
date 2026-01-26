import type { RouteObject } from 'react-router'
import { createBrowserRouter } from 'react-router'
import { BaseLayout } from '../layouts/base-layout'
import { SettingsPage } from '@/pages/Settings'
import { NotFound404Page } from '@/pages/NotFound404'
import { HomePage } from '@/pages/Home'

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
        path: 'update',
        element: <SettingsPage />,
        handle: { breadcrumb: () => 'breadcrumb.update' }
      },
      {
        path: 'settings',
        element: <SettingsPage />,
        handle: { breadcrumb: () => 'breadcrumb.settings' }
      },
      {
        path: '*',
        element: <NotFound404Page />,
        handle: { breadcrumb: () => 'breadcrumb.404' }
      }
    ]
  }
]

export const router = createBrowserRouter(routes, {
  basename: window.location.pathname
})
