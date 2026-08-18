import { queryOptions, useQuery } from "@tanstack/react-query"
import { useAuthToken } from "@/lib/auth-storage"
import { fetchSession } from "../api/auth.api"
import { authKeys } from "../api/auth.keys"

/**
 * Query options definition for session verification.
 */
export function sessionQueryOptions(token: string | null) {
  return queryOptions({
    queryKey: authKeys.session(),
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: token !== null,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

/**
 * Hook to retrieve and subscribe to the active session.
 */
export function useSession() {
  const token = useAuthToken()
  return useQuery(sessionQueryOptions(token))
}
