import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createAccessKey } from "../api/integration.api"
import { integrationKeys } from "../api/integration.keys"
import type { CreateAccessKeyRequest } from "../api/integration.types"

export function useCreateAccessKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccessKeyRequest) => createAccessKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.all })
    },
  })
}
