import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  CreateFolderRequest,
  CreateFolderResponse,
  DownloadTicketResponse,
  InitiateUploadRequest,
  InitiateUploadResponse,
  ListObjectsResponse,
  ObjectMetadataResponse,
  S3ObjectItem,
  UploadPartResponse,
} from "./objects.types"

// In-memory mock storage seeded for the 4 mock buckets
const mockObjects = new Map<string, S3ObjectItem>()

function seedMockData() {
  if (mockObjects.size > 0) return

  const initialItems: Array<{ bucket: string; key: string; size: number; contentType: string }> = [
    { bucket: "documents", key: "reports/q1-report.pdf", size: 2_450_000, contentType: "application/pdf" },
    { bucket: "documents", key: "reports/q2-summary.docx", size: 1_200_000, contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { bucket: "documents", key: "invoice-1024.pdf", size: 450_000, contentType: "application/pdf" },
    { bucket: "documents", key: "notes.txt", size: 1_024, contentType: "text/plain" },
    { bucket: "media-storage", key: "videos/promo-2026.mp4", size: 145_000_000, contentType: "video/mp4" },
    { bucket: "media-storage", key: "photos/banner.jpg", size: 3_200_000, contentType: "image/jpeg" },
    { bucket: "backups", key: "db-dump-2026-08-20.sql.gz", size: 85_000_000, contentType: "application/gzip" },
    { bucket: "public-assets", key: "logo.svg", size: 12_400, contentType: "image/svg+xml" },
    { bucket: "public-assets", key: "styles.css", size: 34_200, contentType: "text/css" },
  ]

  const now = new Date().toISOString()
  for (const item of initialItems) {
    const fullKey = `${item.bucket}/${item.key}`
    const name = item.key.split("/").pop() || item.key
    mockObjects.set(fullKey, {
      key: item.key,
      name,
      size: item.size,
      contentType: item.contentType,
      lastModified: now,
      etag: Math.random().toString(36).substring(2, 15),
    })
  }
}

seedMockData()

export async function mockListObjects(bucket: string, prefix = "", delimiter = "/"): Promise<ListObjectsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  seedMockData()

  const foldersSet = new Set<string>()
  const objects: S3ObjectItem[] = []

  for (const [mapKey, item] of mockObjects.entries()) {
    if (!mapKey.startsWith(`${bucket}/`)) continue
    const key = item.key

    if (!key.startsWith(prefix)) continue

    const suffix = key.slice(prefix.length)
    if (delimiter && suffix.includes(delimiter)) {
      const folderSegment = suffix.split(delimiter)[0]
      foldersSet.add(`${prefix}${folderSegment}/`)
    } else {
      objects.push(item)
    }
  }

  const folders = Array.from(foldersSet)
    .sort()
    .map((folderPrefix) => {
      const trimmed = folderPrefix.endsWith("/") ? folderPrefix.slice(0, -1) : folderPrefix
      const name = trimmed.split("/").pop() || trimmed
      return { prefix: folderPrefix, name }
    })

  return {
    bucket,
    prefix,
    delimiter,
    folders,
    objects,
    truncated: false,
  }
}

export async function mockGetObjectMetadata(bucket: string, key: string): Promise<ObjectMetadataResponse> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  seedMockData()

  const item = mockObjects.get(`${bucket}/${key}`)
  if (!item) {
    throw new Error(`Object '${key}' not found in bucket '${bucket}'`)
  }
  return item
}

export async function mockDeleteObject(bucket: string, key: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  mockObjects.delete(`${bucket}/${key}`)
}

export async function mockCreateFolder(req: CreateFolderRequest): Promise<CreateFolderResponse> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  let prefix = req.prefix
  if (!prefix.endsWith("/")) prefix = `${prefix}/`
  return { prefix }
}

export async function mockDeleteFolder(bucket: string, prefix: string, recursive = false): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  let p = prefix
  if (!p.endsWith("/")) p = `${p}/`

  const matchingKeys: string[] = []
  for (const [mapKey] of mockObjects.entries()) {
    if (mapKey.startsWith(`${bucket}/${p}`)) {
      matchingKeys.push(mapKey)
    }
  }

  if (matchingKeys.length > 0 && !recursive) {
    throw new Error("Folder is not empty")
  }

  for (const key of matchingKeys) {
    mockObjects.delete(key)
  }
}

export async function mockPutObjectContent(bucket: string, key: string, data: Blob | ArrayBuffer | string): Promise<{ key: string; etag: string; size: number }> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  seedMockData()

  let size = 0
  if (typeof data === "string") {
    size = new TextEncoder().encode(data).byteLength
  } else if (data instanceof Blob) {
    size = data.size
  } else if (data instanceof ArrayBuffer) {
    size = data.byteLength
  }

  const name = key.split("/").pop() || key
  const etag = Math.random().toString(36).substring(2, 15)

  mockObjects.set(`${bucket}/${key}`, {
    key,
    name,
    size,
    contentType: (data instanceof Blob ? data.type : "") || "application/octet-stream",
    lastModified: new Date().toISOString(),
    etag,
  })

  return { key, etag, size }
}

export async function mockCreateDownloadTicket(bucket: string, key: string): Promise<DownloadTicketResponse> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const ticket = Math.random().toString(36).substring(2, 15)
  return {
    ticket,
    downloadUrl: `/api/objects/content?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&ticket=${ticket}`,
    expiresIn: 120,
  }
}

export async function mockInitiateUpload(req: InitiateUploadRequest): Promise<InitiateUploadResponse> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    uploadId: `mock-upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    bucket: req.bucket,
    key: req.key,
    partSize: 8 * 1024 * 1024,
  }
}

export async function mockUploadPart(partNumber: number): Promise<UploadPartResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    partNumber,
    etag: `mock-part-etag-${partNumber}`,
  }
}

export async function mockCompleteUpload(req: CompleteUploadRequest): Promise<CompleteUploadResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  seedMockData()

  const name = req.key.split("/").pop() || req.key
  const etag = `mock-complete-etag-${Date.now()}`
  const size = req.totalSize || 10_000_000

  mockObjects.set(`${req.bucket}/${req.key}`, {
    key: req.key,
    name,
    size,
    contentType: "application/octet-stream",
    lastModified: new Date().toISOString(),
    etag,
  })

  return { key: req.key, etag }
}

export async function mockAbortUpload(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
}
