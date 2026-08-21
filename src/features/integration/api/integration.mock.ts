import type {
  AccessKeyFull,
  AccessKeyMetadata,
  AccessKeySecretResponse,
  CreateAccessKeyRequest,
  GraceSeconds,
  IntegrationInfo,
  RotateAccessKeyResponse,
} from "./integration.types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function generateAccessKeyId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  const bytes = new Uint8Array(17)
  crypto.getRandomValues(bytes)
  let id = "GDS"
  for (const byte of bytes) id += chars[byte % chars.length]
  return id
}

function generateSecret(): string {
  const bytes = new Uint8Array(30)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** In-memory key store so the page is fully usable with no backend. */
let mockKeys: AccessKeyFull[] = [
  {
    accessKeyId: "GDSMOCKKEY00000001",
    secretAccessKey: "mock-secret-access-key-do-not-use-0000000000",
    label: "rclone-backup",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    expiresAt: null,
  },
  {
    accessKeyId: "GDSMOCKKEY00000002",
    secretAccessKey: "mock-secret-access-key-do-not-use-1111111111",
    label: "n8n-media-uploads",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
  },
]

const MOCK_BUCKETS = ["documents", "media-storage", "backups", "public-assets"]

function toMetadata(key: AccessKeyFull): AccessKeyMetadata {
  const { secretAccessKey: _secret, ...metadata } = key
  return metadata
}

function requireKey(accessKeyId: string): AccessKeyFull {
  const key = mockKeys.find((k) => k.accessKeyId === accessKeyId)
  if (!key) {
    throw new Error("Access key not found")
  }
  return key
}

export async function mockFetchIntegration(): Promise<IntegrationInfo> {
  await delay(400)
  return {
    endpoint: window.location.origin,
    region: "auto",
    forcePathStyle: true,
    buckets: MOCK_BUCKETS,
    publicReadBuckets: ["public-assets"],
    multipartEnabled: true,
    etagStyle: "md5",
    corsOrigins: ["http://localhost:5173"],
    docsUrl: `${window.location.origin.replace(/:\d+$/, ":8787")}/docs`,
    openApiUrl: `${window.location.origin.replace(/:\d+$/, ":8787")}/openapi.yaml`,
    accessKeys: mockKeys.map(toMetadata),
    limits: {
      maxAccessKeys: 5,
      keyPropagationSeconds: 60,
      presignExpiryMaxSeconds: 7 * 24 * 60 * 60,
    },
  }
}

export async function mockCreateAccessKey(data: CreateAccessKeyRequest): Promise<AccessKeyFull> {
  await delay(500)
  const label = data.label.trim()
  if (!label || label.length > 32 || !/^[a-zA-Z0-9 _-]+$/.test(label)) {
    throw new Error("Label must be 1-32 characters using letters, numbers, spaces, '_' or '-'")
  }
  if (mockKeys.length >= 5) {
    throw new Error("Maximum of 5 access keys reached. Revoke or rotate an existing key first.")
  }
  const key: AccessKeyFull = {
    accessKeyId: generateAccessKeyId(),
    secretAccessKey: generateSecret(),
    label,
    createdAt: new Date().toISOString(),
    expiresAt: null,
  }
  mockKeys = [...mockKeys, key]
  return key
}

export async function mockRotateAccessKey(accessKeyId: string, graceSeconds: GraceSeconds): Promise<RotateAccessKeyResponse> {
  await delay(500)
  const previous = requireKey(accessKeyId)
  if (![0, 3600, 86400, 604800].includes(graceSeconds)) {
    throw new Error("graceSeconds must be one of 0, 3600, 86400, 604800")
  }
  if (mockKeys.length >= 5 && graceSeconds !== 0) {
    throw new Error("Maximum of 5 access keys reached. Revoke an existing key first.")
  }
  const created: AccessKeyFull = {
    accessKeyId: generateAccessKeyId(),
    secretAccessKey: generateSecret(),
    label: previous.label,
    createdAt: new Date().toISOString(),
    expiresAt: null,
  }
  mockKeys = mockKeys
    .map((k) =>
      k.accessKeyId === accessKeyId
        ? { ...k, expiresAt: graceSeconds === 0 ? null : new Date(Date.now() + graceSeconds * 1000).toISOString() }
        : k,
    )
    .filter((k) => k.accessKeyId !== accessKeyId || graceSeconds !== 0)
  mockKeys = [...mockKeys, created]
  return {
    created,
    previous: {
      accessKeyId: previous.accessKeyId,
      expiresAt: graceSeconds === 0 ? null : new Date(Date.now() + graceSeconds * 1000).toISOString(),
    },
  }
}

export async function mockRevealAccessKeySecret(accessKeyId: string): Promise<AccessKeySecretResponse> {
  await delay(300)
  return { secretAccessKey: requireKey(accessKeyId).secretAccessKey }
}

export async function mockRevokeAccessKey(accessKeyId: string): Promise<void> {
  await delay(400)
  requireKey(accessKeyId)
  mockKeys = mockKeys.filter((k) => k.accessKeyId !== accessKeyId)
}
