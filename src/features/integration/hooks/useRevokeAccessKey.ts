import { useMutation, useQueryClient } from "@tanstack/react-query"
import { revokeAccessKey } from "../api/integration.api"
import { integrationKeys } from "../api/integration.keys"

export function useRevokeAccessKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accessKeyId: string) => revokeAccessKey(accessKeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.all })
    },
  })
}
