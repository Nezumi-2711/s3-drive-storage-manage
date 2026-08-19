import type { BucketStat, BucketStatsResponse, StatusResponse } from "../../status/api/status.types"
import type {
  BucketRecord,
  CreateBucketRequest,
  ImportCandidate,
  ImportResult,
  UpdateBucketRequest,
} from "./buckets.types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let mockBuckets: BucketStat[] = [
  {
    name: "documents",
    objectCount: 142,
    totalSize: 1024 * 1024 * 340, // 340 MB
    lastModified: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    truncated: false,
    publicRead: false,
    error: null,
  },
  {
    name: "media-storage",
    objectCount: 890,
    totalSize: 1024 * 1024 * 1024 * 5.2, // 5.2 GB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    truncated: false,
    publicRead: false,
    error: null,
  },
  {
    name: "backups",
    objectCount: 24,
    totalSize: 1024 * 1024 * 850, // 850 MB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    truncated: false,
    publicRead: false,
    error: null,
  },
  {
    name: "public-assets",
    objectCount: 65,
    totalSize: 1024 * 1024 * 45, // 45 MB
    lastModified: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    truncated: false,
    publicRead: true,
    error: null,
  },
]

let mockImportCandidatesList: ImportCandidate[] = [
  {
    name: "archive-2024",
    folderId: "mock-folder-archive",
    objectCount: 128,
  },
  {
    name: "user-avatars",
    folderId: "mock-folder-avatars",
    objectCount: 450,
  },
]

export async function mockFetchStatus(): Promise<StatusResponse> {
  await delay(400)
  return {
    gateway: {
      status: "ok",
      region: "auto",
      multipartEnabled: true,
      etagStyle: "md5",
      docsEnabled: true,
      buckets: mockBuckets.map((b) => b.name),
      publicReadBuckets: mockBuckets.filter((b) => b.publicRead).map((b) => b.name),
      rootFolder: {
        name: "s3-storage",
        id: "mock-root-folder-id",
        configured: true,
      },
      corsOrigins: ["http://localhost:5173"],
      credentials: {
        s3Keys: true,
        googleOAuth: true,
        dashboardPassword: true,
      },
    },
    drive: {
      connected: true,
      account: {
        email: "demo-storage@example.com",
        displayName: "S3 Drive Bridge Admin",
      },
      quota: {
        limit: 15 * 1024 * 1024 * 1024, // 15 GB
        usage: 6.4 * 1024 * 1024 * 1024, // 6.4 GB
        usageInDrive: 6.2 * 1024 * 1024 * 1024,
        usageInDriveTrash: 200 * 1024 * 1024,
        free: 8.6 * 1024 * 1024 * 1024,
        percentUsed: 42.7,
      },
      error: null,
    },
    checkedAt: new Date().toISOString(),
  }
}

export async function mockFetchBucketStats(): Promise<BucketStatsResponse> {
  await delay(600)
  const totalCount = mockBuckets.reduce((acc, b) => acc + b.objectCount, 0)
  const totalSize = mockBuckets.reduce((acc, b) => acc + b.totalSize, 0)

  return {
    buckets: [...mockBuckets],
    totals: {
      buckets: mockBuckets.length,
      objectCount: totalCount,
      totalSize,
    },
    cachedAt: new Date().toISOString(),
  }
}

export async function mockCreateBucket(data: CreateBucketRequest): Promise<BucketRecord> {
  await delay(500)
  if (mockBuckets.some((b) => b.name === data.name)) {
    throw new Error(`Bucket '${data.name}' already exists`)
  }
  const newBucket: BucketStat = {
    name: data.name,
    objectCount: 0,
    totalSize: 0,
    lastModified: new Date().toISOString(),
    truncated: false,
    publicRead: Boolean(data.publicRead),
    error: null,
  }
  mockBuckets = [newBucket, ...mockBuckets]
  return {
    name: data.name,
    folderId: `mock-folder-${data.name}`,
    publicRead: Boolean(data.publicRead),
    createdTime: new Date().toISOString(),
  }
}

export async function mockUpdateBucket(name: string, data: UpdateBucketRequest): Promise<BucketRecord> {
  await delay(400)
  const existing = mockBuckets.find((b) => b.name === name)
  if (!existing) {
    throw new Error(`Bucket '${name}' not found`)
  }

  if (data.name && data.name !== name) {
    if (mockBuckets.some((b) => b.name === data.name)) {
      throw new Error(`Bucket '${data.name}' already exists`)
    }
    existing.name = data.name
  }

  if (data.publicRead !== undefined) {
    existing.publicRead = data.publicRead
  }

  return {
    name: existing.name,
    folderId: `mock-folder-${existing.name}`,
    publicRead: existing.publicRead,
    createdTime: new Date().toISOString(),
  }
}

export async function mockDeleteBucket(name: string): Promise<void> {
  await delay(400)
  const existing = mockBuckets.find((b) => b.name === name)
  if (!existing) {
    throw new Error(`Bucket '${name}' not found`)
  }
  if (existing.objectCount > 0) {
    throw new Error(`Bucket '${name}' is not empty (${existing.objectCount} objects)`)
  }
  mockBuckets = mockBuckets.filter((b) => b.name !== name)
}

export async function mockListImportCandidates(): Promise<ImportCandidate[]> {
  await delay(400)
  return [...mockImportCandidatesList]
}

export async function mockImportBuckets(names: string[]): Promise<ImportResult> {
  await delay(600)
  const imported: string[] = []
  const failed: Array<{ name: string; error: string }> = []

  for (const name of names) {
    const candidate = mockImportCandidatesList.find((c) => c.name === name)
    if (!candidate) {
      failed.push({ name, error: "Candidate not found" })
      continue
    }
    mockBuckets.push({
      name: candidate.name,
      objectCount: candidate.objectCount,
      totalSize: candidate.objectCount * 1024 * 1024 * 2,
      lastModified: new Date().toISOString(),
      truncated: false,
      publicRead: false,
      error: null,
    })
    mockImportCandidatesList = mockImportCandidatesList.filter((c) => c.name !== name)
    imported.push(name)
  }

  return { imported, failed }
}
