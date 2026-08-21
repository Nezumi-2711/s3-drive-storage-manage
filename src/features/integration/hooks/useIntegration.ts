import { queryOptions, useQuery } from "@tanstack/react-query"
import { fetchIntegration } from "../api/integration.api"
import { integrationKeys } from "../api/integration.keys"

export const integrationQueryOptions = () =>
  queryOptions({
    queryKey: integrationKeys.info(),
    queryFn: ({ signal }) => fetchIntegration(signal),
    staleTime: 60_000, // 60s
  })

export function useIntegration() {
  return useQuery(integrationQueryOptions())
}
