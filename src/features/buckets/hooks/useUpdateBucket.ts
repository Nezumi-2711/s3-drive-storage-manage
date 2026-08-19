import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateBucket } from "../api/buckets.api"
import type { UpdateBucketRequest } from "../api/buckets.types"
import { statusKeys } from "../../status/api/status.keys"

export function useUpdateBucket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: UpdateBucketRequest }) =>
      updateBucket(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}
