import { ensureAppError, logError } from '@/shared/lib/errors'
import type { AppErrorMetadata } from '@/shared/lib/errors'
import { createApiError } from './api-errors'
import { createApiSuccess } from './api-response'

interface ApiRequestParams<T> {
  scope: string
  action: string
  metadata?: AppErrorMetadata
  task: () => Promise<T>
}

async function executeApiRequest<T>({ scope, action, metadata, task }: ApiRequestParams<T>) {
  try {
    return await task()
  } catch (error) {
    const enrichedMetadata = {
      scope,
      action,
      ...metadata,
    }

    logError(error, enrichedMetadata)
    throw ensureAppError(error, enrichedMetadata)
  }
}

export async function withApiRequest<T>(params: ApiRequestParams<T>) {
  return executeApiRequest(params)
}

export async function safeApiRequest<T>(params: ApiRequestParams<T>) {
  try {
    const data = await executeApiRequest(params)
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
    query<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return executeApiRequest({
        scope,
        action,
        metadata,
        task,
      })
    },
    mutation<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return executeApiRequest({
        scope,
        action,
        metadata,
        task,
      })
    },
    safeQuery<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return safeApiRequest({
        scope,
        action,
        metadata,
        task,
      })
    },
    safeMutation<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return safeApiRequest({
        scope,
        action,
        metadata,
        task,
      })
    },
    request<T>(action: string, task: () => Promise<T>, metadata?: AppErrorMetadata) {
      return executeApiRequest({
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
