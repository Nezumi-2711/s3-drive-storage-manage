import { queryOptions, useQuery } from "@tanstack/react-query"
import { fetchStatus } from "../api/status.api"
import { statusKeys } from "../api/status.keys"

export const statusQueryOptions = () =>
  queryOptions({
    queryKey: statusKeys.overview(),
    queryFn: ({ signal }) => fetchStatus(signal),
    staleTime: 60_000, // 60s
  })

export function useStatus() {
  return useQuery(statusQueryOptions())
}
