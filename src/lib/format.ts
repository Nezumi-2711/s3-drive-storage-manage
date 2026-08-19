/**
 * Format a number of bytes into a human-readable string (e.g., "8.7 GB", "512 KB").
 */
export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) {
    return "—"
  }
  if (bytes === 0) return "0 B"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const index = Math.min(i, sizes.length - 1)
  const value = bytes / Math.pow(k, index)

  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: dm,
  }).format(value)} ${sizes[index]}`
}

/**
 * Format an ISO timestamp into a relative time string (e.g., "5 minutes ago", "just now").
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return "Never"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return "Unknown"

  const now = Date.now()
  const diffInSeconds = Math.round((date.getTime() - now) / 1000)

  if (Math.abs(diffInSeconds) < 10) {
    return "just now"
  }

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const absSeconds = Math.abs(diffInSeconds)
  if (absSeconds < 60) {
    return rtf.format(diffInSeconds, "second")
  }
  const diffInMinutes = Math.round(diffInSeconds / 60)
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, "minute")
  }
  const diffInHours = Math.round(diffInMinutes / 60)
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, "hour")
  }
  const diffInDays = Math.round(diffInHours / 24)
  return rtf.format(diffInDays, "day")
}
