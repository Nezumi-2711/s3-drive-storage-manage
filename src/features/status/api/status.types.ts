export interface GatewayConfig {
  status: "ok" | "degraded"
  region: string
  multipartEnabled: boolean
  etagStyle: "md5" | "multipart"
  docsEnabled: boolean
  buckets: string[]
  publicReadBuckets: string[]
  rootFolder: {
    name: string | null
    id: string | null
    configured: boolean
  }
  corsOrigins: string[]
  credentials: {
    s3Keys: boolean
    googleOAuth: boolean
    dashboardPassword: boolean
  }
}

export interface DriveQuota {
  limit: number | null
  usage: number
  usageInDrive: number
  usageInDriveTrash: number
  free: number | null
  percentUsed: number | null
}

export interface DriveAccount {
  email: string | null
  displayName: string | null
}

export interface DriveStatus {
  connected: boolean
  account: DriveAccount | null
  quota: DriveQuota | null
  error: string | null
}

export interface StatusResponse {
  gateway: GatewayConfig
  drive: DriveStatus
  checkedAt: string
}

export interface BucketStat {
  name: string
  objectCount: number
  totalSize: number
  lastModified: string | null
  truncated: boolean
  publicRead: boolean
  error: string | null
}

export interface BucketStatsResponse {
  buckets: BucketStat[]
  totals: {
    buckets: number
    objectCount: number
    totalSize: number
  }
  cachedAt: string
}
