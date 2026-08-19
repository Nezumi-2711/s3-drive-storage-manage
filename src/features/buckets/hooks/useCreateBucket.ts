import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBucket } from "../api/buckets.api"
import type { CreateBucketRequest } from "../api/buckets.types"
import { statusKeys } from "../../status/api/status.keys"

export function useCreateBucket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBucketRequest) => createBucket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}
