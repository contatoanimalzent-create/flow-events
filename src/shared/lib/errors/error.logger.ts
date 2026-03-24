import { ensureAppError } from './error.mapper'
import type { AppErrorMetadata, ErrorLogEntry } from './error.types'

function createErrorLogEntry(error: unknown, metadata?: AppErrorMetadata): ErrorLogEntry {
  const appError = ensureAppError(error, metadata)

  return {
    timestamp: new Date().toISOString(),
    message: appError.message,
    code: appError.code,
    kind: appError.kind,
    severity: appError.severity,
    retryable: appError.retryable,
    stack: appError.stack,
    metadata: appError.metadata,
  }
}

export function logError(error: unknown, metadata?: AppErrorMetadata) {
  const entry = createErrorLogEntry(error, metadata)

  if (import.meta.env.DEV) {
    console.warn('[app-error]', entry)
  }

  return entry
}

export async function captureServiceError<T>(params: {
  scope: string
  action: string
  metadata?: AppErrorMetadata
  task: () => Promise<T>
}): Promise<T> {
  try {
    return await params.task()
  } catch (error) {
    logError(error, {
      scope: params.scope,
      action: params.action,
      ...params.metadata,
    })

    throw ensureAppError(error, {
      scope: params.scope,
      action: params.action,
      ...params.metadata,
    })
  }
}
