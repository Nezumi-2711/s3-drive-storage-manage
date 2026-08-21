import { useQuery } from "@tanstack/react-query"
import { listObjects } from "../api/objects.api"
import { objectKeys } from "../api/objects.keys"
import type { ListObjectsResponse } from "../api/objects.types"

export function useObjects(bucket: string, prefix = "", delimiter = "/") {
  return useQuery<ListObjectsResponse, Error>({
    queryKey: objectKeys.list(bucket, prefix),
    queryFn: () => listObjects(bucket, prefix, delimiter),
    enabled: Boolean(bucket),
    staleTime: 30_000,
  })
}
