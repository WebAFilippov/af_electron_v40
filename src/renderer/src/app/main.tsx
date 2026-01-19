import '@/shared/styles/globals.css'

import log from 'electron-log/renderer'

import ReactDOM from 'react-dom/client'

import { RouterProvider } from 'react-router/dom'
import { router } from './routing'
import { appStarted } from '@/shared/model'

Object.assign(console, log.functions)

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)

appStarted()

root.render(<RouterProvider router={router} />)

console.log('hello renderer')
