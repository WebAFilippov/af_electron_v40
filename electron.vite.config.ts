import { resolve } from 'path'
import { defineConfig, swcPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  main: {
    plugins: [swcPlugin()],
    resolve: {
      alias: {
        // The `electron` package's CJS entry exports a string path, not the
        // Electron API, so a bare `electron` import fails under real ESM with
        // "does not provide an export named ...". Electron only provides the
        // API surface through the `electron/main` subpath. Map it explicitly.
        electron: 'electron/main',
        '@/app': resolve('src/main/app'),
        '@/ipc': resolve('src/main/ipc'),
        '@/modules': resolve('src/main/modules'),
        '@/shared': resolve('src/main/shared'),
        '@/shared_app': resolve('src/shared/')
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
    resolve: {
      alias: {
        // Same issue as the main process: a bare `electron` import resolves to
        // the package's CJS path-string entry under ESM. The renderer-process
        // API surface lives in the `electron/renderer` subpath.
        electron: 'electron/renderer',
        '@/shared_app': resolve('src/shared/')
      }
    },
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
        '@/pages': resolve(__dirname, 'src/renderer/src/pages'),
        '@/widgets': resolve(__dirname, 'src/renderer/src/widgets'),
        '@/features': resolve(__dirname, 'src/renderer/src/features'),
        '@/entities': resolve(__dirname, 'src/renderer/src/entities'),
        '@/shared': resolve(__dirname, 'src/renderer/src/shared'),
        '@/shared_app': resolve(__dirname,'src/shared/')
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
