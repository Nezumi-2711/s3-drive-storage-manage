import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFolder } from "../api/objects.api"
import { objectKeys } from "../api/objects.keys"
import type { CreateFolderRequest, CreateFolderResponse } from "../api/objects.types"

export function useCreateFolder(bucket: string, currentPrefix = "") {
  const queryClient = useQueryClient()

  return useMutation<CreateFolderResponse, Error, CreateFolderRequest>({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.list(bucket, currentPrefix) })
    },
  })
}
