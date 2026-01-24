import { Toaster } from '@/shared/ui'
import { SidebarWidget } from '@/widgets/sidebar'
import { WindowControlPanel } from '@/widgets/window-control-panel'
import type { ReactNode } from 'react'

export const BaseLayout = (): ReactNode => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <WindowControlPanel />
      <div className="relative flex flex-1 overflow-hidden">
        <Toaster position="bottom-right" expand={false} richColors offset={{ bottom: '40px' }} />
        <SidebarWidget />
      </div>
    </div>
  )
}
