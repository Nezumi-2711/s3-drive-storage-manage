import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteFolder } from "../api/objects.api"
import { objectKeys } from "../api/objects.keys"

export function useDeleteFolder(bucket: string, currentPrefix = "") {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { prefix: string; recursive?: boolean }>({
    mutationFn: ({ prefix, recursive }) => deleteFolder(bucket, prefix, recursive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.list(bucket, currentPrefix) })
    },
  })
}
