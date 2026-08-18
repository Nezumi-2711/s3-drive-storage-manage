import { QueryClient, QueryCache } from "@tanstack/react-query"
import { ApiError } from "./api-client"
import { clearAuthToken } from "./auth-storage"

/**
 * Factory function to create a new configured QueryClient instance.
 */
export function createQueryClient(): QueryClient {
  let client: QueryClient

  const queryCache = new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthToken()
        client?.clear()
      }
    },
  })

  client = new QueryClient({
    queryCache,
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
