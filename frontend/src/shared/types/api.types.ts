export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    requestId?: string
  }
}

export interface PaginatedApiResponse<T> {
  data: T[]
  meta: {
    limit: number
    page: number
    requestId?: string
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  details?: unknown
  message: string
  path?: string
  requestId?: string
  statusCode?: number
}
