/** Formats a byte count using binary units (1 KB = 1024 B). */
export const formatBytes = (bytes: number, fractionDigits = 1): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)

  // Whole numbers for bytes, one decimal place beyond that unless it rounds to
  // a clean integer.
  const digits = exponent === 0 ? 0 : value >= 100 ? 0 : fractionDigits

  return `${value.toFixed(digits)} ${units[exponent]}`
}

/** Formats a throughput value as `X/s`. */
export const formatSpeed = (bytesPerSecond: number): string => `${formatBytes(bytesPerSecond)}/s`

/** Formats a duration in seconds as a compact `1d 4h 20m` string. */
export const formatUptime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '—'
  }

  const totalMinutes = Math.floor(seconds / 60)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`)

  return parts.join(' ')
}

/** Formats a frequency in MHz, switching to GHz above 1000 MHz. */
export const formatFrequency = (mhz: number): string => {
  if (!Number.isFinite(mhz) || mhz <= 0) {
    return '—'
  }
  return mhz >= 1000 ? `${(mhz / 1000).toFixed(2)} GHz` : `${Math.round(mhz)} MHz`
}

/** Formats a link speed given in Mbps. */
export const formatLinkSpeed = (mbps: number): string => {
  if (!Number.isFinite(mbps) || mbps <= 0) {
    return '—'
  }
  return mbps >= 1000 ? `${(mbps / 1000).toFixed(1)} Gbit/s` : `${Math.round(mbps)} Mbit/s`
}

/** Returns true when the device reports a plausible battery. */
export const clampPercent = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(100, Math.max(0, value))
}
