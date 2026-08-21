export interface AccessKeyMetadata {
  accessKeyId: string
  label: string
  createdAt: string
  expiresAt: string | null
}

export interface AccessKeyFull extends AccessKeyMetadata {
  secretAccessKey: string
}

export interface IntegrationInfo {
  endpoint: string
  region: string
  forcePathStyle: true
  buckets: string[]
  publicReadBuckets: string[]
  multipartEnabled: boolean
  etagStyle: "md5" | "multipart"
  corsOrigins: string[]
  docsUrl: string | null
  openApiUrl: string | null
  accessKeys: AccessKeyMetadata[]
  limits: {
    maxAccessKeys: number
    keyPropagationSeconds: number
    presignExpiryMaxSeconds: number
  }
}

export interface CreateAccessKeyRequest {
  label: string
}

export type GraceSeconds = 0 | 3600 | 86400 | 604800

export interface RotateAccessKeyRequest {
  graceSeconds: GraceSeconds
}

export interface RotateAccessKeyResponse {
  created: AccessKeyFull
  previous: {
    accessKeyId: string
    expiresAt: string | null
  }
}

export interface AccessKeySecretResponse {
  secretAccessKey: string
}
