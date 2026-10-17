import type { MonitorCapabilities, MonitorSample, TerminateProcessResult } from '@/shared_app/types'

export interface IMonitorApp {
  getSnapshot: (force?: boolean) => Promise<MonitorSample | null>
  getCapabilities: () => Promise<MonitorCapabilities>
  terminateProcess: (pid: number) => Promise<TerminateProcessResult>
}
