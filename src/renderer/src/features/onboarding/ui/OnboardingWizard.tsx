import type { ReactNode } from 'react'
import { useUnit } from 'effector-react'
import { Activity, ArrowLeft, ArrowRight, Check, X } from 'lucide-react'

import { $t } from '@/entities/i18next'
import { Button, Dialog, DialogContent, Progress } from '@/shared/ui'
import { cn } from '@/shared/lib'
import {
  $isVisible,
  $step,
  $stepIndex,
  completeOnboarding,
  nextStep,
  ONBOARDING_STEPS,
  previousStep
} from '../model/onboarding'

const STEP_ICONS = [Activity, Check] as const

export const OnboardingWizard = (): ReactNode => {
  const t = useUnit($t)
  const [isVisible, stepIndex, step, handleNext, handlePrevious, handleComplete] = useUnit([
    $isVisible,
    $stepIndex,
    $step,
    nextStep,
    previousStep,
    completeOnboarding
  ])

  if (!isVisible) {
    return null
  }

  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1
  const Icon = STEP_ICONS[stepIndex] ?? Activity

  return (
    <Dialog open onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent className="max-w-lg gap-0 p-0" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{t(`onboarding.${step}_title`)}</h2>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.step_of', { current: stepIndex + 1, total: ONBOARDING_STEPS.length })}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label={t('onboarding.skip')}
            onClick={() => handleComplete()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <p className={cn('text-sm text-muted-foreground', step === 'welcome' && 'text-base')}>
            {t(`onboarding.${step}_description`)}
          </p>

          {step === 'welcome' && (
            <ul className="space-y-2 text-sm">
              {(['welcome_point_monitor', 'welcome_point_weather', 'welcome_point_tray'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                  <span className="text-muted-foreground">{t(`onboarding.${key}`)}</span>
                </li>
              ))}
            </ul>
          )}

          {step === 'ready' && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                {t('onboarding.ready_hint')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t p-4 px-6">
          <Progress value={((stepIndex + 1) / ONBOARDING_STEPS.length) * 100} className="h-1 max-w-24" />

          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => handlePrevious()}>
                <ArrowLeft className="h-4 w-4" />
                {t('onboarding.back')}
              </Button>
            )}

            {isLastStep ? (
              <Button size="sm" className="gap-2" onClick={() => handleComplete()}>
                <Check className="h-4 w-4" />
                {t('onboarding.finish')}
              </Button>
            ) : (
              <Button size="sm" className="gap-2" onClick={() => handleNext()}>
                {t('onboarding.next')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
