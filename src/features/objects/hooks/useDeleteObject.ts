import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteObject } from "../api/objects.api"
import { objectKeys } from "../api/objects.keys"

export function useDeleteObject(bucket: string, currentPrefix = "") {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (key: string) => deleteObject(bucket, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.list(bucket, currentPrefix) })
    },
  })
}
