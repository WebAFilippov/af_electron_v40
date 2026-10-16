import { CloudSun, Cpu, House, PackageCheck, Settings } from 'lucide-react'

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
      icon: <House strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.weather',
      url: '/weather',
      icon: <CloudSun strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.monitor',
      url: '/monitor',
      icon: <Cpu strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.update',
      url: '/update',
      icon: <PackageCheck strokeWidth={2} />
    },
    {
      title: 'nav.sidebar.settings',
      url: '/settings',
      icon: <Settings strokeWidth={2} />
    }
  ]
}
