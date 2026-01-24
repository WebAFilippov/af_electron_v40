import { resolve } from 'path'
import { defineConfig, swcPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * @type {import('electron-vite').UserConfig}
 */
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
      reportCompressedSize: true,
      minify: 'esbuild',
      rollupOptions: {
        external: ['sqlite3'],
        treeshake: {
          preset: 'recommended',
          annotations: true,
          moduleSideEffects: false
        },
        output: {
          minifyInternalExports: true,
          compact: true,
          format: 'es',
          manualChunks(id): string | void {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    }
  },
  preload: {
    plugins: [],
    build: {
      isolatedEntries: true,
      outDir: 'out/preload',
      reportCompressedSize: true,
      minify: 'esbuild',
      rollupOptions: {
        treeshake: {
          preset: 'recommended',
          annotations: true,
          moduleSideEffects: false
        },
        output: {
          minifyInternalExports: true,
          compact: true,
          format: 'es',
          manualChunks(id): string | void {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    }
  },
  renderer: {
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
      reportCompressedSize: true,
      minify: 'esbuild',
      rollupOptions: {
        treeshake: {
          preset: 'recommended',
          annotations: true,
          moduleSideEffects: false
        },
        output: {
          minifyInternalExports: true,
          compact: true,
          format: 'es',
          indent: false,
          manualChunks(id): string | void {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    },
    plugins: [
      react({
        babel: {}
      }),
      tailwindcss()
    ]
  }
})
