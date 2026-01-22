import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [],
    resolve: {
      alias: {
        '@/app': resolve('src/main/app'),
        '@/ipc': resolve('src/main/apc'),
        '@/modules': resolve('src/main/modules'),
        '@/shared': resolve('src/main/shared')
      }
    },
    build: {
      reportCompressedSize: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
            return undefined
          }
        }
      }
    }
  },
  preload: {
    plugins: [],
    build: {
      reportCompressedSize: false
    }
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
    build: {
      reportCompressedSize: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
            return undefined
          }
        }
      }
    },
    plugins: [
      react({
        babel: {
          plugins: ['effector/babel-plugin']
        }
      }),
      tailwindcss()
    ]
  }
})
