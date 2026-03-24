import type { ApiErrorResponse } from './api-errors'

export interface ApiResponseMeta {
  timestamp: string
  [key: string]: unknown
}

export interface ApiSuccessResponse<T> {
  ok: true
  data: T
  meta: ApiResponseMeta
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function createApiSuccess<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  return {
    ok: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(meta ?? {}),
    },
  }
}
