export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}
