import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { lingui } from '@lingui/vite-plugin'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [lingui()],
    resolve: {
      alias: {
        '@/app': resolve('src/main/app'),
        '@/ipc': resolve('src/main/apc'),
        '@/modules': resolve('src/main/modules'),
        '@/shared': resolve('src/main/shared')
      }
    }
  },
  preload: {
    plugins: []
  },
  renderer: {
    resolve: {
      alias: {
        '@/app': resolve('src/renderer/src/app'),
        '@/entites': resolve('src/renderer/src/entities'),
        '@/pages': resolve('src/renderer/src/pages'),
        '@/widgets': resolve('src/renderer/src/widgets'),
        '@/entities': resolve('src/renderer/src/entities'),
        '@/shared': resolve('src/renderer/src/shared')
      }
    },
    plugins: [react(), tailwindcss(), lingui()]
  }
})
