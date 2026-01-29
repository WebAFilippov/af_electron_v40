import { appStartedFx } from '@/shared/model'
import { createStore, sample } from 'effector'

interface Model {
  chec
}



const $checked = createStore(true)


sample({
    clock: appStartedFx.doneData,
    fn: (data) => data.settings.checkUpdateOnStart,
    target: $checked
})