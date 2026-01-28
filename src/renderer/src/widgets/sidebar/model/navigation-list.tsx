import { HugeiconsIcon } from '@hugeicons/react'
import { InstallingUpdates02Icon, Settings02Icon } from '@hugeicons/core-free-icons'

interface NavigationItem {
  title: string
  url: string
  icon?: React.ReactNode
  children?: NavigationItem[]
}

export const NAVIGATION_LIST: Record<string, NavigationItem[]> = {
  navMain: [
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
