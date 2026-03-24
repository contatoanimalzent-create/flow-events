import { ensureAppError } from '@/shared/lib/errors'
import type { AppErrorKind, AppErrorMetadata, AppErrorSeverity } from '@/shared/lib/errors'

export interface ApiErrorPayload {
  message: string
  code: string
  kind: AppErrorKind
  severity: AppErrorSeverity
  retryable: boolean
  metadata?: AppErrorMetadata
}

export interface ApiErrorResponse {
  ok: false
  error: ApiErrorPayload
}

export function createApiError(error: unknown, metadata?: AppErrorMetadata): ApiErrorResponse {
  const appError = ensureAppError(error, metadata)

  return {
    ok: false,
    error: {
      message: appError.message,
      code: appError.code,
      kind: appError.kind,
      severity: appError.severity,
      retryable: appError.retryable,
      metadata: appError.metadata,
    },
  }
}
