export interface ISettingsApp {
  setAutoLaunch: (value: boolean) => Promise<boolean>
  setStartMinimazeOnStart: (value: boolean) => Promise<boolean>
  setCheckUpdateOnStart: (value: boolean) => Promise<boolean>
}
