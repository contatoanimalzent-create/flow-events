import type { AppError, AppErrorKind, AppErrorMetadata, AppErrorSeverity } from './error.types'

function inferKind(code: string, message: string): AppErrorKind {
  const normalizedCode = code.toLowerCase()
  const normalizedMessage = message.toLowerCase()

  if (normalizedCode.includes('auth') || normalizedMessage.includes('unauthorized') || normalizedMessage.includes('authentication')) {
    return 'authentication'
  }

  if (normalizedCode.includes('permission') || normalizedCode.includes('forbidden') || normalizedMessage.includes('permission')) {
    return 'authorization'
  }

  if (normalizedCode.includes('validation') || normalizedMessage.includes('invalid') || normalizedMessage.includes('required')) {
    return 'validation'
  }

  if (normalizedCode.includes('not_found') || normalizedMessage.includes('not found')) {
    return 'not_found'
  }

  if (normalizedCode.includes('conflict') || normalizedMessage.includes('conflict')) {
    return 'conflict'
  }

  if (normalizedMessage.includes('network') || normalizedMessage.includes('fetch')) {
    return 'network'
  }

  if (normalizedMessage.includes('database') || normalizedMessage.includes('supabase')) {
    return 'database'
  }

  if (normalizedCode.includes('service')) {
    return 'service'
  }

  return 'unknown'
}

function inferSeverity(kind: AppErrorKind): AppErrorSeverity {
  switch (kind) {
    case 'authorization':
    case 'authentication':
    case 'validation':
    case 'conflict':
      return 'warning'
    case 'not_found':
      return 'info'
    case 'network':
    case 'database':
    case 'service':
    case 'unknown':
    default:
      return 'error'
  }
}

function inferRetryable(kind: AppErrorKind) {
  return kind === 'network' || kind === 'database' || kind === 'service'
}

export function mapError(error: unknown, metadata?: AppErrorMetadata): AppError {
  if (error instanceof Error && 'code' in error && 'kind' in error && 'severity' in error && 'retryable' in error) {
    return {
      ...(error as AppError),
      metadata: {
        ...(error as AppError).metadata,
        ...metadata,
      },
    }
  }

  if (error instanceof Error) {
    const rawCode = typeof (error as { code?: unknown }).code === 'string' ? String((error as { code?: string }).code) : 'app_error'
    const kind = inferKind(rawCode, error.message)

    return Object.assign(new Error(error.message), {
      name: error.name || 'AppError',
      message: error.message,
      code: rawCode,
      kind,
      severity: inferSeverity(kind),
      retryable: inferRetryable(kind),
      metadata,
      cause: error,
      stack: error.stack,
    } satisfies AppError)
  }

  const message = typeof error === 'string' ? error : 'Unexpected application error'
  const kind = inferKind('app_error', message)

  return Object.assign(new Error(message), {
    name: 'AppError',
    message,
    code: 'app_error',
    kind,
    severity: inferSeverity(kind),
    retryable: inferRetryable(kind),
    metadata,
    cause: error,
  } satisfies AppError)
}

export function ensureAppError(error: unknown, metadata?: AppErrorMetadata): AppError {
  return mapError(error, metadata)
}
