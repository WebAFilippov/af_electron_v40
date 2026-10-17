import { resolve } from 'path'
import { cpSync, existsSync, mkdirSync } from 'fs'
import { defineConfig, swcPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Copies the compiled native addon into `resources/`.
 *
 * Rollup cannot bundle a `.node` binary, so the addon is marked external and
 * placed alongside the sensor helper. Keeping every native artifact in one
 * directory means the loader has a single place to look in both development and
 * a packaged build, instead of matching the layout of `out/main`.
 *
 * In a packaged app `resources/**` is unpacked from the asar archive, so the
 * binary is a real file on disk and can be loaded by the OS.
 */
const copyNativeAddon = () => {
  const source = resolve('src/main/native/build/Release/system_monitor.node')
  const destinationDir = resolve('resources/native')

  return {
    name: 'copy-native-system-monitor',
    closeBundle() {
      if (!existsSync(source)) {
        // Building the addon is a separate step (`npm run native:build`); a
        // missing binary must not fail the JS build, it only disables monitoring.
        console.warn(`[copy-native-system-monitor] ${source} not found; system monitoring will be unavailable.`)
        return
      }

      mkdirSync(destinationDir, { recursive: true })
      cpSync(source, resolve(destinationDir, 'system_monitor.node'))
      console.log(`[copy-native-system-monitor] copied to ${destinationDir}`)
    }
  }
}

export default defineConfig({
  main: {
    plugins: [swcPlugin(), copyNativeAddon()],
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
        // The native addon is a binary and cannot be bundled; it is copied into
        // out/main/native by the plugin above and required at runtime.
        external: [/\.node$/],
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
