import type { BucketStatsResponse, StatusResponse } from "./status.types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockFetchStatus(): Promise<StatusResponse> {
  await delay(400)
  return {
    gateway: {
      status: "ok",
      region: "auto",
      multipartEnabled: true,
      etagStyle: "md5",
      docsEnabled: true,
      buckets: ["documents", "media-storage", "backups", "public-assets"],
      publicReadBuckets: ["public-assets"],
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
  const buckets = [
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

  const totalCount = buckets.reduce((acc, b) => acc + b.objectCount, 0)
  const totalSize = buckets.reduce((acc, b) => acc + b.totalSize, 0)

  return {
    buckets,
    totals: {
      buckets: buckets.length,
      objectCount: totalCount,
      totalSize,
    },
    cachedAt: new Date().toISOString(),
  }
}
