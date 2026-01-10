import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'
import {
  Cancel01Icon,
  ChangeScreenModeIcon,
  Remove01Icon,
  SquareIcon
} from '@hugeicons/core-free-icons'
import { useGate, useUnit } from 'effector-react'
import { ReactNode } from 'react'
import {
  $windowFullscreen,
  $windowMaximize,
  GateWindow,
  setWindowClose,
  setWindowMaximize,
  setWindowMinimize
} from '../models/window-header'
import { HugeiconsIcon } from '@hugeicons/react'

export const SidebarWindowHeader = (): ReactNode => {
  useGate(GateWindow)

  const [windowFullscreen, windowMaximize, handleMinimize, handleMaximize, handleClose] = useUnit([
    $windowFullscreen,
    $windowMaximize,
    setWindowMinimize,
    setWindowMaximize,
    setWindowClose
  ])

  return (
    <header
      className={cn(
        'drag-on bg-sidebar z-50 flex h-9 w-full shrink-0 items-center justify-end',
        windowFullscreen && 'hidden'
      )}
    >
      <div className="drag-off flex items-center justify-center ">
        <Button
          tabIndex={-1}
          variant="ghost"
          size="icon"
          className="rounded-xs"
          onClick={handleMinimize}
        >
          <HugeiconsIcon icon={Remove01Icon} className="size-4" />
        </Button>
        <Button
          tabIndex={-1}
          variant="ghost"
          size="icon"
          className="rounded-xs"
          onClick={handleMaximize}
        >
          {!windowMaximize ? (
            <HugeiconsIcon icon={SquareIcon} className="size-4" />
          ) : (
            <HugeiconsIcon icon={ChangeScreenModeIcon} className="size-4" />
          )}
        </Button>
        <Button
          tabIndex={-1}
          variant="ghost_destructive"
          size="icon"
          className="rounded-xs"
          onClick={handleClose}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
        </Button>
      </div>
    </header>
  )
}
