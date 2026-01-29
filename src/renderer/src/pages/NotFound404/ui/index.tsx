import { $t } from '@/entities/i18next'
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader } from '@/shared/ui'
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

export const NotFound404Page = (): ReactNode => {
  const t = useUnit($t)
  const navigate = useNavigate()

  const goBack = () => {
    navigate(-1)
  }

  return (
    <Empty>
      <EmptyHeader>{t('page.404.title')}</EmptyHeader>
      <EmptyDescription>{t('page.404.description')}</EmptyDescription>
      <EmptyContent>
        <Button onClick={goBack}>{t('page.404.button_go_back')}</Button>
      </EmptyContent>
    </Empty>
  )
}
