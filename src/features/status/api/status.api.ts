import { apiRequest, IS_MOCK_MODE } from "@/lib/api-client"
import { mockFetchBucketStats, mockFetchStatus } from "./status.mock"
import type { BucketStatsResponse, StatusResponse } from "./status.types"

/**
 * Fetch gateway overview and drive connection status.
 */
export async function fetchStatus(signal?: AbortSignal): Promise<StatusResponse> {
  if (IS_MOCK_MODE) {
    return mockFetchStatus()
  }

  return apiRequest<StatusResponse>("/api/status", {
    method: "GET",
    signal,
  })
}

/**
 * Fetch bucket metrics and object statistics.
 */
export async function fetchBucketStats(
  signal?: AbortSignal,
  refresh?: boolean
): Promise<BucketStatsResponse> {
  if (IS_MOCK_MODE) {
    return mockFetchBucketStats()
  }

  const query = refresh ? "?refresh=1" : ""
  return apiRequest<BucketStatsResponse>(`/api/buckets${query}`, {
    method: "GET",
    signal,
  })
}
