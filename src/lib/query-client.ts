import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query"
import { ApiError } from "./api-client"
import { clearAuthToken } from "./auth-storage"

/**
 * Factory function to create a new configured QueryClient instance.
 */
export function createQueryClient(): QueryClient {
  let client: QueryClient

  const handle401 = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthToken()
      client?.clear()
    }
  }

  const queryCache = new QueryCache({
    onError: handle401,
  })

  const mutationCache = new MutationCache({
    onError: handle401,
  })

  client = new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false
          }
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })

  return client
}
