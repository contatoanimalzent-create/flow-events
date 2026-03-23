export interface ServiceError {
  code: string
  message: string
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError }
