import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [],
    resolve: {
      alias: {
        '@/lib': resolve('src/main/lib'),
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
        '@/shared': resolve('src/renderer/src/shared')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
