import { resolve } from 'path'
import { defineConfig, swcPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [swcPlugin()],
    resolve: {
      alias: {
        '@/app': resolve('src/main/app'),
        '@/ipc': resolve('src/main/ipc'),
        '@/modules': resolve('src/main/modules'),
        '@/shared': resolve('src/main/shared')
      }
    },
    build: {
      outDir: 'out/main',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        external: ['sqlite3'],
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false
        },
        output: {
          format: 'es',
          compact: true
        }
      }
    }
  },

  preload: {
    base: './',
    build: {
      isolatedEntries: true,
      outDir: 'out/preload',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false
        },
        output: {
          format: 'es',
          compact: true
        }
      }
    }
  },

  renderer: {
    base: './',
    publicDir: 'src/shared/public',
    resolve: {
      alias: {
        '@/app': resolve(__dirname, 'src/renderer/src/app'),
        '@/entities': resolve(__dirname, 'src/renderer/src/entities'),
        '@/pages': resolve(__dirname, 'src/renderer/src/pages'),
        '@/widgets': resolve(__dirname, 'src/renderer/src/widgets'),
        '@/shared': resolve(__dirname, 'src/renderer/src/shared')
      }
    },
    build: {
      isolatedEntries: true,
      outDir: 'out/renderer',
      minify: 'esbuild',
      sourcemap: false,
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false
        },
        output: {
          format: 'es',
          compact: true
        }
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
