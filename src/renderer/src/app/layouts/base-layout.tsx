import { WindowHeader } from '@/shared/ui'
import { SidebarWidget } from '@/widgets/sidebar'
import { ReactNode } from 'react'

export const BaseLayout = (): ReactNode => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <WindowHeader />
      <SidebarWidget />
    </div>
  )
}
