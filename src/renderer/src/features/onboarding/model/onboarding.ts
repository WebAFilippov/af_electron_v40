import { createEvent, createStore, sample } from 'effector'
import { persist } from 'effector-storage/local'

import { startMonitoring } from '@/entities/system-monitor'

/**
 * First-run wizard state.
 *
 * The wizard exists because what the app does is not discoverable from a blank
 * window. It is shown once and can be dismissed permanently.
 */

/** Bumped when the wizard gains a step worth showing again to existing users. */
const ONBOARDING_VERSION = 2

const completeOnboarding = createEvent()
const reopenOnboarding = createEvent()
const nextStep = createEvent()
const previousStep = createEvent()

// The `sensors` step was removed together with the elevated sensor helper: there
// is no longer an optional component to install, so a step explaining one would
// only describe a limitation.
export const ONBOARDING_STEPS = ['welcome', 'ready'] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

/**
 * Stores the completed wizard version, or 0 when it has never been finished.
 * Persisting the version rather than a boolean makes it possible to re-show the
 * wizard after a meaningful update without resetting it for everyone by hand.
 */
const $completedVersion = createStore<number>(0)
  .on(completeOnboarding, () => ONBOARDING_VERSION)
  .reset(reopenOnboarding)

persist({ store: $completedVersion, key: 'onboarding-version' })

const $isCompleted = $completedVersion.map((version) => version >= ONBOARDING_VERSION)

const $stepIndex = createStore(0)
  .on(nextStep, (index) => Math.min(index + 1, ONBOARDING_STEPS.length - 1))
  .on(previousStep, (index) => Math.max(index - 1, 0))
  .reset(completeOnboarding, reopenOnboarding)

const $step = $stepIndex.map((index) => ONBOARDING_STEPS[index])

const $isVisible = createStore(false)
  .on(reopenOnboarding, () => true)
  .on(completeOnboarding, () => false)

// The wizard opens on the first run only. `$isCompleted` is restored from
// localStorage before this runs, so a returning user never sees a flash of it.
sample({
  clock: $isCompleted,
  filter: (isCompleted) => !isCompleted,
  fn: () => undefined,
  target: reopenOnboarding
})

// Monitoring has to be running for the wizard to show live numbers.
sample({
  clock: reopenOnboarding,
  target: startMonitoring
})

export {
  $completedVersion,
  $isCompleted,
  $isVisible,
  $step,
  $stepIndex,
  completeOnboarding,
  nextStep,
  previousStep,
  reopenOnboarding
}
