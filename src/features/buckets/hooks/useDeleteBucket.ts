import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteBucket } from "../api/buckets.api"
import { statusKeys } from "../../status/api/status.keys"

export function useDeleteBucket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => deleteBucket(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}
