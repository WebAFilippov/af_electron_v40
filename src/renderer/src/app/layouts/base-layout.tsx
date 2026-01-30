import { $theme } from '@/entities/theme'
import { Toaster } from '@/shared/ui'
import { SidebarWidget } from '@/widgets/sidebar'
import { WindowControlPanel } from '@/widgets/window-control-panel'
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'

export const BaseLayout = (): ReactNode => {
  const theme = useUnit($theme)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <WindowControlPanel />
      <div className="relative flex flex-1 overflow-hidden">
        <Toaster theme={theme.mode} position="bottom-right" expand={false} richColors offset={{ bottom: '40px' }} />
        <SidebarWidget />
      </div>
    </div>
  )
}
