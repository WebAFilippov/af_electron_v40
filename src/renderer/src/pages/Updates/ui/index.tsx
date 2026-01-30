import type { ReactNode } from 'react'

import { UpdatePanel } from '@/entities/updater'

export const UpdatePage = (): ReactNode => {
  return (
    <div className="flex flex-col gap-3">
      <UpdatePanel />
    </div>
  )
}
