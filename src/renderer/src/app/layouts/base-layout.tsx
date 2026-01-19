import { Toaster, WindowHeader } from '@/shared/ui'
import { SidebarWidget } from '@/widgets/sidebar'
import { ReactNode } from 'react'

export const BaseLayout = (): ReactNode => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <WindowHeader />
      <div className="relative flex flex-1 overflow-hidden">
        <Toaster position="bottom-right" expand={false} richColors offset={{ bottom: '40px' }} />
        <SidebarWidget />
      </div>
    </div>
  )
}
