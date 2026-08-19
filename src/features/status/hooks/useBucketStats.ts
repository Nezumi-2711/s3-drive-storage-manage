import { queryOptions, useQuery } from "@tanstack/react-query"
import { fetchBucketStats } from "../api/status.api"
import { statusKeys } from "../api/status.keys"

export const bucketStatsQueryOptions = () =>
  queryOptions({
    queryKey: statusKeys.buckets(),
    queryFn: ({ signal }) => fetchBucketStats(signal),
    staleTime: 5 * 60_000, // 5 min
  })

export function useBucketStats() {
  return useQuery(bucketStatsQueryOptions())
}
