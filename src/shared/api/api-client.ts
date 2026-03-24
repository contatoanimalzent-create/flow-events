import { captureServiceError } from '@/shared/lib/errors'
import type { AppErrorMetadata } from '@/shared/lib/errors'
import { createApiError } from './api-errors'
import { createApiSuccess } from './api-response'

interface ApiRequestParams<T> {
  scope: string
  action: string
  metadata?: AppErrorMetadata
  task: () => Promise<T>
}

export async function withApiRequest<T>({ scope, action, metadata, task }: ApiRequestParams<T>) {
  return captureServiceError({
    scope,
    action,
    metadata,
    task,
  })
}

export async function safeApiRequest<T>(params: ApiRequestParams<T>) {
  try {
    const data = await withApiRequest(params)
    return createApiSuccess(data)
  } catch (error) {
    return createApiError(error, {
      scope: params.scope,
      action: params.action,
      ...params.metadata,
    })
  }
}

export function createApiClient(scope: string) {
  return {
    request<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return withApiRequest({
        scope,
        action,
        metadata,
        task,
      })
    },
    safeRequest<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return safeApiRequest({
        scope,
        action,
        metadata,
        task,
      })
    },
  }
}
