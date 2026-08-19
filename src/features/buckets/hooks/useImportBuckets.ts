import { useMutation, useQueryClient } from "@tanstack/react-query"
import { importBuckets } from "../api/buckets.api"
import { statusKeys } from "../../status/api/status.keys"
import { bucketKeys } from "../api/buckets.keys"

export function useImportBuckets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (names: string[]) => importBuckets(names),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
      queryClient.invalidateQueries({ queryKey: bucketKeys.all })
    },
  })
}
