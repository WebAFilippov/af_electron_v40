#!/usr/bin/env node
/**
 * Builds the native system-monitor addon for the exact Electron ABI used by the
 * app.
 *
 * Why this wrapper exists instead of a plain `node-gyp rebuild` script:
 *
 *  1. `electron` pins a specific Node ABI (Electron 40 -> NODE_MODULE_VERSION
 *     143), so the addon must be compiled against Electron's headers, not the
 *     system Node's. Otherwise loading it fails with a version mismatch.
 *  2. node-gyp needs a real Python 2.7/3.x interpreter. On Windows the Store
 *     stub `python.exe` shadows any missing install, so the interpreter is
 *     detected explicitly and reported clearly when absent.
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const nativeDir = join(rootDir, 'src', 'main', 'native')
const addonPath = join(nativeDir, 'build', 'Release', 'system_monitor.node')

const [, , command = 'build', ...rest] = process.argv
const isDebug = rest.includes('--debug')

const electronVersion = require('electron/package.json').version
const nodeGypPath = require.resolve('node-gyp/bin/node-gyp.js')

/**
 * Locates a usable Python interpreter. The Microsoft Store aliases in
 * %LOCALAPPDATA%\Microsoft\WindowsApps are 0-byte reparse points that merely
 * open the Store, so they are skipped.
 */
const findPython = () => {
  const candidates = [
    process.env.PYTHON,
    process.env.npm_config_python,
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python312', 'python.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python311', 'python.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python310', 'python.exe'),
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe'
  ]

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

const run = (args, env) => {
  const result = spawnSync(process.execPath, [nodeGypPath, ...args], {
    cwd: nativeDir,
    stdio: 'inherit',
    env: { ...process.env, ...env }
  })

  if (result.error) {
    console.error(`\nFailed to start node-gyp: ${result.error.message}`)
    process.exit(1)
  }

  // node-gyp returns 0 on success; any non-zero code is a real build failure.
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const python = findPython()

if (!python) {
  console.error(
    [
      '',
      'Python was not found, and node-gyp requires it to configure the build.',
      '',
      'Install it with:',
      '    winget install --id Python.Python.3.12 --scope user',
      '',
      'Then re-run:  npm run native:build',
      ''
    ].join('\n')
  )
  process.exit(1)
}

// The Electron target must be passed to `configure` as well: it is what writes
// the ABI-specific settings into config.gypi. Passing it only to `build` (as a
// naive script would) generates a project for the system Node and the addon then
// fails to load with a NODE_MODULE_VERSION mismatch.
const electronArgs = ['--target=' + electronVersion, '--arch=' + process.arch, '--dist-url=https://electronjs.org/headers']

if (isDebug) {
  electronArgs.push('--debug')
}

console.log(`Building system-monitor addon for Electron ${electronVersion} (${process.arch})`)
console.log(`  python: ${python}`)
console.log(`  output: ${addonPath}\n`)

// `node-gyp build` refuses to run without a generated project, and a clean
// checkout (or a deleted build/ directory) has none, so configure first when the
// project files are absent.
const projectFile = join(nativeDir, 'build', 'binding.sln')
const needsConfigure = !existsSync(projectFile)

if (needsConfigure && command === 'build') {
  console.log('No existing build project found; running configure first.\n')
  run(['configure', ...electronArgs], { PYTHON: python })
}

run([command, ...electronArgs], { PYTHON: python })

if (command !== 'configure' && !existsSync(addonPath)) {
  console.error(`\nBuild reported success but ${addonPath} is missing.`)
  process.exit(1)
}

if (command !== 'configure') {
  console.log(`\nNative addon built: ${addonPath}`)
}
