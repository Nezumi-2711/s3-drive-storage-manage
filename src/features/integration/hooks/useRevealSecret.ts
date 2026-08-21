import { useMutation } from "@tanstack/react-query"
import { revealAccessKeySecret } from "../api/integration.api"

export function useRevealSecret() {
  return useMutation({
    mutationFn: (accessKeyId: string) => revealAccessKeySecret(accessKeyId),
  })
}
