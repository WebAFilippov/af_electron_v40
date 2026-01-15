import { ReactNode } from 'react'
import { useGate, useUnit } from 'effector-react'
import { cn } from '@/shared/lib'
import {
  Cancel01Icon,
  ChangeScreenModeIcon,
  Remove01Icon,
  SquareIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  $windowFullscreen,
  $windowMaximize,
  GateWindowHeader,
  handleWindowClose,
  handleWindowMaximaze,
  handleWindowMinimaze
} from '../model/window-header-model'
import { Button } from '@/shared/ui'

export const WindowHeader = (): ReactNode => {
  useGate(GateWindowHeader)

  const [windowFullscreen, windowMaximize, handleMinimize, handleMaximize, handleClose] = useUnit([
    $windowFullscreen,
    $windowMaximize,
    handleWindowMinimaze,
    handleWindowMaximaze,
    handleWindowClose
  ])

  return (
    <header
      className={cn(
        'drag-on bg-sidebar text-sidebar-foreground z-50 flex h-9 w-full shrink-0 items-center justify-end',
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
