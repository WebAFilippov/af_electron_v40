import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon, AiCloud01Icon, InstallingUpdates02Icon, Settings02Icon } from '@hugeicons/core-free-icons'

interface NavigationItem {
  title: string
  url: string
  icon?: React.ReactNode
  children?: NavigationItem[]
}

export const NAVIGATION_LIST: Record<string, NavigationItem[]> = {
  navMain: [
    {
      title: 'nav.sidebar.home',
      url: '/',
      icon: <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.weather',
      url: '/weather',
      icon: <HugeiconsIcon icon={AiCloud01Icon} strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.update',
      url: '/update',
      icon: <HugeiconsIcon icon={InstallingUpdates02Icon} strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.settings',
      url: '/settings',
      icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
    }
  ]
}
