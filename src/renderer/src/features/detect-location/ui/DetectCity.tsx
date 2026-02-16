import { $t } from '@/entities/i18next'
import { Button, Spinner } from '@/shared/ui'

import { useUnit } from 'effector-react'
import { MapPin } from 'lucide-react'
import { FC, HTMLAttributes } from 'react'
import { $isPending, detectLocationByIP } from '../model/detect-location'

interface DetectLocationProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled' | 'variant'> {}

export const DetectLocation: FC<DetectLocationProps> = (props) => {
  const t = useUnit($t)
  const [pending, detectLocation] = useUnit([$isPending, detectLocationByIP])

  return (
    <Button onClick={() => detectLocation()} disabled={pending} variant="outline" {...props}>
      {pending ? (
        <>
          <Spinner />
          {t('features.detect-location.pending_detect')}
        </>
      ) : (
        <>
          <MapPin />
          {t('features.detect-location.detect')}
        </>
      )}
    </Button>
  )
}
