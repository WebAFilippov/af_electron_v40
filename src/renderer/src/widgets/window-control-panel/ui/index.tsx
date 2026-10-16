import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { cn } from '@/shared/lib'
import { Minus, Square, Minimize, X } from 'lucide-react'
import { Button } from '@/shared/ui'
import { $isFullscreen, $isMaximized, closeWindowFx, maximizeWindowFx, minimizeWindowFx } from '../model'

export const WindowControlPanel = (): ReactNode => {
  const [isFullscreen, isMaximized, handleMinimize, handleMaximize, handleClose] = useUnit([
    $isFullscreen,
    $isMaximized,
    minimizeWindowFx,
    maximizeWindowFx,
    closeWindowFx
  ])

  return (
    <header
      className={cn(
        'drag-on bg-sidebar text-sidebar-foreground z-1000 flex h-9 w-full shrink-0 items-center justify-end',
        isFullscreen && 'hidden'
      )}
    >
      <div className="drag-off flex items-center justify-center ">
        <Button tabIndex={-1} variant="ghost" size="icon" className="rounded-xs" onClick={handleMinimize}>
          <Minus />
        </Button>
        <Button tabIndex={-1} variant="ghost" size="icon" className="rounded-xs" onClick={handleMaximize}>
          {!isMaximized ? <Square /> : <Minimize />}
        </Button>
        <Button tabIndex={-1} variant="ghost" size="icon" className="rounded-xs " onClick={handleClose}>
          <X />
        </Button>
      </div>
    </header>
  )
}
