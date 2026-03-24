import { createApiSuccess } from './api-response'

export interface ApiPaginationParams {
  page?: number
  pageSize?: number
}

export interface ApiPaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ApiPaginatedSuccessResponse<T> {
  ok: true
  data: T[]
  meta: {
    timestamp: string
    pagination: ApiPaginationMeta
  }
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

export function normalizePagination(params?: ApiPaginationParams): Required<ApiPaginationParams> {
  const rawPage = Number(params?.page ?? DEFAULT_PAGE)
  const rawPageSize = Number(params?.pageSize ?? DEFAULT_PAGE_SIZE)

  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE,
    pageSize: Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE,
  }
}

export function buildPaginationMeta(total: number, params?: ApiPaginationParams): ApiPaginationMeta {
  const { page, pageSize } = normalizePagination(params)
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
  const safePage = Math.min(page, totalPages)

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
}

export function paginateItems<T>(items: T[], params?: ApiPaginationParams) {
  const meta = buildPaginationMeta(items.length, params)
  const startIndex = (meta.page - 1) * meta.pageSize
  return {
    items: items.slice(startIndex, startIndex + meta.pageSize),
    pagination: meta,
  }
}

export function createPaginatedResponse<T>(items: T[], params?: ApiPaginationParams): ApiPaginatedSuccessResponse<T> {
  const { items: paginatedItems, pagination } = paginateItems(items, params)
  const response = createApiSuccess(paginatedItems, { pagination })

  return {
    ...response,
    meta: {
      timestamp: response.meta.timestamp,
      pagination,
    },
  }
}
