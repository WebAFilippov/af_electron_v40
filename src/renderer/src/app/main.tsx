import '../shared/styles/globals.css'

import { createRoot } from 'react-dom/client'
import { SidebarInsetExample } from '@/widgets/sidebar'
import { ThemeProvider } from './providers/theme-providers'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SidebarInsetExample />
  </ThemeProvider>
)
