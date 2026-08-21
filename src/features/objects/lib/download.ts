import { createDownloadTicket, downloadObjectDirect } from "../api/objects.api"

/**
 * Triggers a browser file download using either a ticket or blob URL fallback.
 */
export async function downloadObject(bucket: string, key: string, useTicket = true): Promise<void> {
  const filename = key.split("/").filter(Boolean).pop() || "download"

  if (useTicket) {
    try {
      const ticketRes = await createDownloadTicket(bucket, key)
      const baseUrl = import.meta.env.VITE_API_URL || ""
      const url = `${baseUrl}${ticketRes.downloadUrl}`

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    } catch (err) {
      console.warn("Download ticket failed, falling back to direct blob download:", err)
    }
  }

  // Fallback to direct download via Blob
  const blob = await downloadObjectDirect(bucket, key)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Safari requires setTimeout before revoking object URL
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
