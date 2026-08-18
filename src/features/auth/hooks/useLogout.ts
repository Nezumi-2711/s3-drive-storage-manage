import { useMutation, useQueryClient } from "@tanstack/react-query"
import { clearAuthToken } from "@/lib/auth-storage"
import { logout } from "../api/auth.api"
import { authKeys } from "../api/auth.keys"

/**
 * Mutation hook for logging out and clearing credentials.
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuthToken()
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}
