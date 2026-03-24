export type AppErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export type AppErrorKind =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'conflict'
  | 'network'
  | 'database'
  | 'service'
  | 'unknown'

export interface AppErrorMetadata {
  scope?: string
  action?: string
  organizationId?: string | null
  userId?: string | null
  [key: string]: unknown
}

export interface AppError extends Error {
  code: string
  kind: AppErrorKind
  severity: AppErrorSeverity
  retryable: boolean
  metadata?: AppErrorMetadata
  cause?: unknown
}

export interface ErrorLogEntry {
  timestamp: string
  message: string
  code: string
  kind: AppErrorKind
  severity: AppErrorSeverity
  retryable: boolean
  stack?: string
  metadata?: AppErrorMetadata
}
