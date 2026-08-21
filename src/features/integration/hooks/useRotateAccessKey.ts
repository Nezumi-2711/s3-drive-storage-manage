import { useMutation, useQueryClient } from "@tanstack/react-query"
import { rotateAccessKey } from "../api/integration.api"
import { integrationKeys } from "../api/integration.keys"
import type { GraceSeconds } from "../api/integration.types"

export function useRotateAccessKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ accessKeyId, graceSeconds }: { accessKeyId: string; graceSeconds: GraceSeconds }) =>
      rotateAccessKey(accessKeyId, graceSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.all })
    },
  })
}
