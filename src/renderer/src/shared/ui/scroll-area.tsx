import * as React from 'react'
import { cn } from '@/shared/lib'

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { className?: string }>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('relative overflow-auto', className)} {...props}>
      {children}
    </div>
  )
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
