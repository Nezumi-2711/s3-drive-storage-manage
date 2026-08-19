import { apiRequest, IS_MOCK_MODE } from "../../../lib/api-client"
import type {
  BucketRecord,
  CreateBucketRequest,
  ImportCandidate,
  ImportCandidatesResponse,
  ImportResult,
  UpdateBucketRequest,
} from "./buckets.types"
import {
  mockCreateBucket,
  mockImportBuckets,
  mockListImportCandidates,
  mockUpdateBucket,
  mockDeleteBucket,
} from "./buckets.mock"

export async function createBucket(data: CreateBucketRequest): Promise<BucketRecord> {
  if (IS_MOCK_MODE) {
    return mockCreateBucket(data)
  }
  return apiRequest<BucketRecord>("/api/buckets", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateBucket(name: string, data: UpdateBucketRequest): Promise<BucketRecord> {
  if (IS_MOCK_MODE) {
    return mockUpdateBucket(name, data)
  }
  return apiRequest<BucketRecord>(`/api/buckets/${encodeURIComponent(name)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteBucket(name: string): Promise<void> {
  if (IS_MOCK_MODE) {
    return mockDeleteBucket(name)
  }
  return apiRequest<void>(`/api/buckets/${encodeURIComponent(name)}`, {
    method: "DELETE",
  })
}

export async function fetchImportCandidates(): Promise<ImportCandidate[]> {
  if (IS_MOCK_MODE) {
    return mockListImportCandidates()
  }
  const response = await apiRequest<ImportCandidatesResponse>("/api/import-candidates")
  return response.candidates
}

export async function importBuckets(names: string[]): Promise<ImportResult> {
  if (IS_MOCK_MODE) {
    return mockImportBuckets(names)
  }
  return apiRequest<ImportResult>("/api/import", {
    method: "POST",
    body: JSON.stringify({ names }),
  })
}
