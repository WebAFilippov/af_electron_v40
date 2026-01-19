import { HugeiconsIcon } from '@hugeicons/react'
import { InstallingUpdates02Icon, Settings02Icon, Settings03Icon } from '@hugeicons/core-free-icons'

export const NAVIGATION_LIST = {
  navMain: [
    {
      title: 'Настройки',
      url: '/settings',
      icon: <HugeiconsIcon icon={Settings03Icon} strokeWidth={2} />,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '#'
        },
        {
          title: 'Analytics',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Обновления',
      url: '/update',
      icon: <HugeiconsIcon icon={InstallingUpdates02Icon} strokeWidth={2} />
    },
    {
      title: 'Настройки',
      url: '/settings',
      icon: <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
    }
  ]
}
