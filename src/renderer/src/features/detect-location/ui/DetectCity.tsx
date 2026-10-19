import { $t } from '@/entities/i18next'
import { Button, Spinner } from '@/shared/ui'

import { useUnit } from 'effector-react'
import { LocateFixed } from 'lucide-react'
import { FC, HTMLAttributes } from 'react'
import { $isDetectPending, detectLocationByIP } from '../model/detect-location'

interface DetectLocationProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled' | 'variant'> {}

/**
 * Button that guesses the city from the IP address.
 *
 * Kept as an explicit action rather than a silent side effect: the result changes
 * what the whole page shows, so the user should be able to trigger it deliberately.
 */
export const DetectLocation: FC<DetectLocationProps> = (props) => {
  const t = useUnit($t)
  const [pending, detectLocation] = useUnit([$isDetectPending, detectLocationByIP])

  return (
    <Button
      onClick={() => detectLocation()}
      disabled={pending}
      variant="outline"
      className="gap-2"
      title={t('features.detect-location.detect_hint')}
      {...props}
    >
      {pending ? (
        <>
          <Spinner />
          {t('features.detect-location.pending_detect')}
        </>
      ) : (
        <>
          <LocateFixed />
          {t('features.detect-location.detect')}
        </>
      )}
    </Button>
  )
}
