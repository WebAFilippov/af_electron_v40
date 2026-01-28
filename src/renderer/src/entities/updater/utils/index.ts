export const formatBytes = (bytes: number, isSpeed: boolean = false): string => {
  const KB = 1024
  const MB = KB * 1024

  if (bytes >= MB) {
    return `${(bytes / MB).toFixed(2)} МБ${isSpeed ? '/с' : ''}`
  } else if (bytes >= KB) {
    return `${(bytes / KB).toFixed(2)} КБ${isSpeed ? '/с' : ''}`
  } else {
    return `${bytes} байт${isSpeed ? '/с' : ''}`
  }
}
