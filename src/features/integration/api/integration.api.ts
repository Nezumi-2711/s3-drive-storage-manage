import { apiRequest, IS_MOCK_MODE } from "@/lib/api-client"
import {
  mockCreateAccessKey,
  mockFetchIntegration,
  mockRevealAccessKeySecret,
  mockRevokeAccessKey,
  mockRotateAccessKey,
} from "./integration.mock"
import type {
  AccessKeyFull,
  AccessKeySecretResponse,
  CreateAccessKeyRequest,
  GraceSeconds,
  IntegrationInfo,
  RotateAccessKeyResponse,
} from "./integration.types"

/**
 * Fetch connection details and access key metadata.
 */
export async function fetchIntegration(signal?: AbortSignal): Promise<IntegrationInfo> {
  if (IS_MOCK_MODE) {
    return mockFetchIntegration()
  }
  return apiRequest<IntegrationInfo>("/api/integration", { method: "GET", signal })
}

/**
 * Create a named access key pair. The secret is only returned here.
 */
export async function createAccessKey(data: CreateAccessKeyRequest): Promise<AccessKeyFull> {
  if (IS_MOCK_MODE) {
    return mockCreateAccessKey(data)
  }
  return apiRequest<AccessKeyFull>("/api/integration/keys", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Rotate a key. The old key is deleted immediately when graceSeconds is 0.
 */
export async function rotateAccessKey(accessKeyId: string, graceSeconds: GraceSeconds): Promise<RotateAccessKeyResponse> {
  if (IS_MOCK_MODE) {
    return mockRotateAccessKey(accessKeyId, graceSeconds)
  }
  return apiRequest<RotateAccessKeyResponse>(
    `/api/integration/keys/${encodeURIComponent(accessKeyId)}/rotate`,
    {
      method: "POST",
      body: JSON.stringify({ graceSeconds }),
    },
  )
}

/**
 * Reveal a key's secret (rate-limited server-side).
 */
export async function revealAccessKeySecret(accessKeyId: string): Promise<AccessKeySecretResponse> {
  if (IS_MOCK_MODE) {
    return mockRevealAccessKeySecret(accessKeyId)
  }
  return apiRequest<AccessKeySecretResponse>(`/api/integration/keys/${encodeURIComponent(accessKeyId)}/secret`, {
    method: "GET",
  })
}

/**
 * Revoke a key immediately.
 */
export async function revokeAccessKey(accessKeyId: string): Promise<void> {
  if (IS_MOCK_MODE) {
    return mockRevokeAccessKey(accessKeyId)
  }
  return apiRequest<void>(`/api/integration/keys/${encodeURIComponent(accessKeyId)}`, {
    method: "DELETE",
  })
}
