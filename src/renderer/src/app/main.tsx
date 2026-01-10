import '@/shared/styles/globals.css'

import ReactDOM from 'react-dom/client'

import { RouterProvider } from 'react-router/dom'
import { router } from './routing'
import { AppStarter } from '@/shared/model'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)

AppStarter()

root.render(<RouterProvider router={router} />)
