import { UpdatePanel } from '@/entities/updater'
import type { ReactNode } from 'react'

export const UpdatePage = (): ReactNode => {
  return (
    <div className="flex flex-col gap-3">
      <UpdatePanel />
    </div>
  )
}
