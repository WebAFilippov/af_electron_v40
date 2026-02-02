import '@/shared/styles/globals.css'

import ReactDOM from 'react-dom/client'
import { createEvent, sample } from 'effector'
import { RouterProvider } from 'react-router/dom'

import { router } from './routing'

import { initWindowControlsFx } from '@/widgets/window-control-panel'
import { initI18Next } from '@/entities/i18next'
import { initThemeFx } from '@/entities/theme'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)

const appStarted = createEvent<void>()

sample({
  clock: appStarted,
  target: [initThemeFx, initWindowControlsFx, initI18Next]
})

window.log_app.toRenderer(console.log)

appStarted()

root.render(<RouterProvider router={router} />)
