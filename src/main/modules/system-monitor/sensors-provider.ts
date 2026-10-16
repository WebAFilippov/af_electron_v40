import { execFile } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { app } from 'electron/main'
// `shell` is not re-exported from the `electron/main` subpath used for the rest
// of the API surface, so it comes from the top-level module.
import { shell } from 'electron'

import { logger } from '@/shared/utils/logger'
import { loadNativeMonitor } from './native-loader'

const execFileAsync = promisify(execFile)

export type SensorProviderState = 'active' | 'installed' | 'missing' | 'unsupported'

export interface SensorStatus {
  /** Whether the WMI provider currently answers (LHM running with its provider on). */
  active: boolean
  /** Whether LibreHardwareMonitor is present on disk or registered in WinGet. */
  installed: boolean
  /** Where the executable was found, when it could be located. */
  executablePath: string | null
  /** True when winget is available to perform an install. */
  wingetAvailable: boolean
  /** Whether the PawnIO kernel driver (LHM's hardware access layer) is present. */
  driverInstalled: boolean
  state: SensorProviderState
}

const WINGET_PACKAGE_ID = 'LibreHardwareMonitor.LibreHardwareMonitor'

/** Checks a path without throwing; `fs.existsSync` already does, but this keeps intent explicit. */
const safeExists = (path: string): boolean => {
  try {
    return existsSync(path)
  } catch {
    return false
  }
}

const findInWinGetPackages = (): string | null => {
  const packagesDir = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages')
  if (!safeExists(packagesDir)) {
    return null
  }

  // WinGet names the folder after the package id plus a source hash, so the
  // exact suffix is not stable and the directory has to be scanned.
  try {
    for (const entry of readdirSync(packagesDir)) {
      if (!entry.toLowerCase().includes('librehardwaremonitor')) {
        continue
      }
      const candidate = join(packagesDir, entry, 'LibreHardwareMonitor.exe')
      if (safeExists(candidate)) {
        return candidate
      }
    }
  } catch {
    return null
  }

  return null
}

const findExecutable = (): string | null => {
  const candidates = [
    join(process.env.ProgramFiles ?? '', 'LibreHardwareMonitor', 'LibreHardwareMonitor.exe'),
    join(process.env['ProgramFiles(x86)'] ?? '', 'LibreHardwareMonitor', 'LibreHardwareMonitor.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'LibreHardwareMonitor', 'LibreHardwareMonitor.exe')
  ]

  for (const candidate of candidates) {
    if (safeExists(candidate)) {
      return candidate
    }
  }

  return findInWinGetPackages()
}

const isDriverInstalled = (): boolean => {
  const candidates = [
    join(process.env.ProgramFiles ?? '', 'PawnIO', 'PawnIOLib.dll'),
    // WinRing0 was LHM's previous access layer; older installs still use it.
    join(process.env.SystemRoot ?? '', 'System32', 'drivers', 'WinRing0x64.sys')
  ]

  return candidates.some(safeExists)
}

const hasWinget = async (): Promise<boolean> => {
  try {
    await execFileAsync('winget', ['--version'], { timeout: 10_000, windowsHide: true })
    return true
  } catch {
    return false
  }
}

/** Reads the live state of the temperature provider and everything it depends on. */
export const getSensorStatus = async (): Promise<SensorStatus> => {
  const monitor = loadNativeMonitor()

  // The probe is re-run here (not just read from cache) so that starting LHM in
  // another window is picked up on the next UI refresh.
  let active = false
  if (monitor !== null) {
    try {
      active = monitor.refreshSensors()
    } catch {
      active = false
    }
  }

  const executablePath = findExecutable()
  const [wingetAvailable, driverInstalled] = await Promise.all([hasWinget(), Promise.resolve(isDriverInstalled())])

  const installed = executablePath !== null

  const state: SensorProviderState = active
    ? 'active'
    : installed
      ? 'installed'
      : process.platform === 'win32'
        ? 'missing'
        : 'unsupported'

  return { active, installed, executablePath, wingetAvailable, driverInstalled, state }
}

/**
 * Installs LibreHardwareMonitor through winget.
 *
 * The package ships a kernel driver, so Windows raises a UAC prompt: a silent,
 * unattended install is not possible. `--silent` only suppresses the installer's
 * own UI; elevation is still requested by the OS.
 */
export const installSensorProvider = async (): Promise<{ ok: boolean; message: string }> => {
  if (process.platform !== 'win32') {
    return { ok: false, message: 'unsupported-platform' }
  }

  const wingetAvailable = await hasWinget()
  if (!wingetAvailable) {
    return { ok: false, message: 'winget-missing' }
  }

  logger.info({ packageId: WINGET_PACKAGE_ID }, 'Installing LibreHardwareMonitor via winget')

  try {
    const { stdout } = await execFileAsync(
      'winget',
      [
        'install',
        '--id',
        WINGET_PACKAGE_ID,
        '--exact',
        '--accept-package-agreements',
        '--accept-source-agreements',
        '--disable-interactivity'
      ],
      // Installing a package with a kernel driver can take a while, and winget
      // waits for the elevated installer to finish.
      { timeout: 10 * 60 * 1000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }
    )

    logger.info({ output: stdout.slice(-2000) }, 'LibreHardwareMonitor install finished')
    return { ok: true, message: 'installed' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ error: message }, 'LibreHardwareMonitor install failed')
    return { ok: false, message }
  }
}

/**
 * Launches LibreHardwareMonitor elevated.
 *
 * The executable is manifested `requireAdministrator`, so a plain spawn fails
 * with "The requested operation requires elevation". `shell.openPath` is not
 * enough either — it uses the default verb. Opening the containing folder is the
 * only action available without UAC, so that is what the UI offers as a fallback.
 */
export const launchSensorProvider = async (): Promise<{ ok: boolean; message: string }> => {
  const status = await getSensorStatus()

  if (status.executablePath === null) {
    return { ok: false, message: 'not-installed' }
  }

  try {
    // `shell.openPath` runs the file with its default verb. Because the manifest
    // demands elevation, Windows shows the UAC prompt — which is the intended,
    // user-visible confirmation.
    const error = await shell.openPath(status.executablePath)
    if (error) {
      logger.warn({ error, path: status.executablePath }, 'Failed to launch LibreHardwareMonitor')
      return { ok: false, message: error }
    }

    return { ok: true, message: 'launched' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, message }
  }
}

/** Opens the LibreHardwareMonitor download page in the default browser. */
export const openSensorProviderWebsite = async (): Promise<void> => {
  await shell.openExternal('https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases/latest')
}

/** Restarts the app so the freshly installed provider is picked up reliably. */
export const relaunchApp = (): void => {
  app.relaunch()
  app.exit(0)
}
