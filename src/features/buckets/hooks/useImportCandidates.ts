import { useQuery } from "@tanstack/react-query"
import { fetchImportCandidates } from "../api/buckets.api"
import { bucketKeys } from "../api/buckets.keys"

export function useImportCandidates(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bucketKeys.importCandidates(),
    queryFn: fetchImportCandidates,
    enabled: options?.enabled ?? true,
    staleTime: 10_000,
  })
}
