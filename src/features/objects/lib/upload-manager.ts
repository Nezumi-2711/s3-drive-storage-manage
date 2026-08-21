import {
  abortMultipartUpload,
  completeMultipartUpload,
  initiateMultipartUpload,
  putObjectContent,
  uploadMultipartPart,
} from "../api/objects.api"

export type UploadStatus =
  | "queued"
  | "initiating"
  | "uploading"
  | "completing"
  | "done"
  | "error"
  | "canceled"

export interface UploadItem {
  id: string
  file: File
  bucket: string
  key: string
  prefix: string
  size: number
  progress: number // 0 to 100
  bytesUploaded: number
  status: UploadStatus
  errorMessage?: string
  uploadId?: string
  currentPart?: number
  totalParts?: number
  abortController?: AbortController
}

type Listener = () => void

const MAX_CONCURRENT_FILES = 2
const DIRECT_UPLOAD_LIMIT = 8 * 1024 * 1024 // 8 MiB
const PART_SIZE = 8 * 1024 * 1024 // 8 MiB part chunks

class UploadManager {
  private queue: UploadItem[] = []
  private activeUploads = 0
  private listeners = new Set<Listener>()
  private onCompleteCallback?: (item: UploadItem) => void

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", (e) => {
        if (this.hasActiveUploads()) {
          e.preventDefault()
          e.returnValue = ""
        }
      })
    }
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): UploadItem[] => {
    return this.queue
  }

  private notify() {
    this.queue = [...this.queue]
    for (const listener of this.listeners) {
      listener()
    }
  }

  setOnCompleteCallback(cb: (item: UploadItem) => void) {
    this.onCompleteCallback = cb
  }

  hasActiveUploads(): boolean {
    return this.queue.some(
      (item) =>
        item.status === "queued" ||
        item.status === "initiating" ||
        item.status === "uploading" ||
        item.status === "completing"
    )
  }

  addFiles(files: File[], bucket: string, prefix: string) {
    const newItems: UploadItem[] = files.map((file) => {
      const key = `${prefix}${file.name}`
      return {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        bucket,
        key,
        prefix,
        size: file.size,
        progress: 0,
        bytesUploaded: 0,
        status: "queued",
      }
    })

    this.queue.push(...newItems)
    this.notify()
    this.processQueue()
  }

  cancelUpload(id: string) {
    const item = this.queue.find((i) => i.id === id)
    if (!item) return

    if (item.abortController) {
      item.abortController.abort()
    }

    if (item.uploadId && item.status !== "done") {
      abortMultipartUpload(item.bucket, item.key, item.uploadId).catch(() => {})
    }

    item.status = "canceled"
    this.notify()
    this.processQueue()
  }

  retryUpload(id: string) {
    const item = this.queue.find((i) => i.id === id)
    if (!item || (item.status !== "error" && item.status !== "canceled")) return

    item.status = "queued"
    item.progress = 0
    item.bytesUploaded = 0
    item.errorMessage = undefined
    item.uploadId = undefined
    item.currentPart = undefined
    item.totalParts = undefined
    item.abortController = undefined

    this.notify()
    this.processQueue()
  }

  clearFinished() {
    this.queue = this.queue.filter(
      (i) => i.status !== "done" && i.status !== "canceled" && i.status !== "error"
    )
    this.notify()
  }

  private processQueue() {
    if (this.activeUploads >= MAX_CONCURRENT_FILES) return

    const nextItem = this.queue.find((item) => item.status === "queued")
    if (!nextItem) return

    this.activeUploads++
    this.startUpload(nextItem).finally(() => {
      this.activeUploads--
      this.processQueue()
    })
  }

  private async startUpload(item: UploadItem) {
    item.abortController = new AbortController()

    try {
      if (item.size <= DIRECT_UPLOAD_LIMIT) {
        await this.handleDirectUpload(item)
      } else {
        await this.handleMultipartUpload(item)
      }

      item.status = "done"
      item.progress = 100
      item.bytesUploaded = item.size
      this.notify()
      if (this.onCompleteCallback) {
        this.onCompleteCallback(item)
      }
    } catch (err: unknown) {
      if (item.status === "canceled") return

      item.status = "error"
      item.errorMessage = err instanceof Error ? err.message : String(err)
      this.notify()
    }
  }

  private async handleDirectUpload(item: UploadItem) {
    item.status = "uploading"
    item.progress = 50
    this.notify()

    await putObjectContent(
      item.bucket,
      item.key,
      item.file,
      item.file.type || "application/octet-stream"
    )
  }

  private async handleMultipartUpload(item: UploadItem) {
    item.status = "initiating"
    this.notify()

    const initRes = await initiateMultipartUpload({
      bucket: item.bucket,
      key: item.key,
      contentType: item.file.type || "application/octet-stream",
    })

    item.uploadId = initRes.uploadId
    const partSize = initRes.partSize || PART_SIZE
    const totalParts = Math.ceil(item.size / partSize) || 1
    item.totalParts = totalParts
    item.status = "uploading"
    this.notify()

    const completedParts: Array<{ partNumber: number; etag: string }> = []
    let totalBytesUploaded = 0

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      if ((item.status as UploadStatus) === "canceled") break

      item.currentPart = partNumber
      const start = (partNumber - 1) * partSize
      const end = Math.min(start + partSize, item.size)
      const partBlob = item.file.slice(start, end)
      const partLength = end - start

      // Upload part with retry for 503 / network errors
      let partResult: { partNumber: number; etag: string } | null = null
      let attempts = 0
      const maxAttempts = 3

      while (!partResult && attempts < maxAttempts) {
        attempts++
        try {
          partResult = await uploadMultipartPart(
            item.bucket,
            item.key,
            item.uploadId,
            partNumber,
            partBlob,
            item.abortController?.signal,
            (loaded) => {
              const currentTotal = totalBytesUploaded + loaded
              item.bytesUploaded = currentTotal
              item.progress = Math.min(99, Math.round((currentTotal / item.size) * 100))
              this.notify()
            }
          )
        } catch (err: unknown) {
          const status = (err as { status?: number }).status
          const retryAfter = (err as { retryAfter?: string }).retryAfter
          if (status === 503 && attempts < maxAttempts) {
            const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1500 * attempts
            await new Promise((resolve) => setTimeout(resolve, delayMs))
          } else if (attempts >= maxAttempts) {
            throw err
          }
        }
      }

      if (!partResult) {
        throw new Error(`Failed to upload part ${partNumber}`)
      }

      completedParts.push({ partNumber, etag: partResult.etag })
      totalBytesUploaded += partLength
      item.bytesUploaded = totalBytesUploaded
      item.progress = Math.min(99, Math.round((totalBytesUploaded / item.size) * 100))
      this.notify()
    }

    if ((item.status as UploadStatus) === "canceled") return

    item.status = "completing"
    this.notify()

    await completeMultipartUpload({
      bucket: item.bucket,
      key: item.key,
      uploadId: item.uploadId,
      parts: completedParts,
      totalSize: item.size,
    })
  }
}

export const uploadManager = new UploadManager()
