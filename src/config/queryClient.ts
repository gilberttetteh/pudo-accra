import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query client.
 *
 * Defaults are tuned for a data-heavy GIS dashboard: moderate staleness
 * tolerance to avoid redundant refetching of spatial data, and a single
 * retry to avoid masking real backend errors during development.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
