import { useMutation, useQueryClient } from "@tanstack/react-query"
import { setAuthToken } from "@/lib/auth-storage"
import { login } from "../api/auth.api"
import { authKeys } from "../api/auth.keys"
import type { LoginResponse } from "../api/auth.types"

/**
 * Mutation hook for authenticating and logging in.
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) => login(password),
    onSuccess: (data: LoginResponse) => {
      setAuthToken(data.token)
      queryClient.setQueryData(authKeys.session(), { valid: true })
    },
  })
}
