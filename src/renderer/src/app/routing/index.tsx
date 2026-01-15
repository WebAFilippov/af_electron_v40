import { createBrowserRouter } from 'react-router'
import { BaseLayout } from '../layouts/base-layout'
import { SettingsPage } from '@/pages/Settings'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <BaseLayout />,
      children: [
        {
          path: '/update',
          element: <SettingsPage />
        },
        {
          path: '/settings',
          element: <SettingsPage />
        }
      ]
    }
  ],
  {
    basename: window.location.pathname
  }
)
