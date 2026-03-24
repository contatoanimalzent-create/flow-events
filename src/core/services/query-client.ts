import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ensureAppError, logError } from '@/shared/lib'

function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false
  }

  return ensureAppError(error).retryable
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logError(error, {
        scope: 'react-query',
        action: 'query',
        queryKey: Array.isArray(query.queryKey) ? query.queryKey.join(':') : String(query.queryKey),
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logError(error, {
        scope: 'react-query',
        action: 'mutation',
        mutationKey: Array.isArray(mutation.options.mutationKey) ? mutation.options.mutationKey.join(':') : String(mutation.options.mutationKey ?? ''),
      })
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: 0,
    },
  },
})
