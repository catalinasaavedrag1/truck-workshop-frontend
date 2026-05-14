import { useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return {
    page,
    pageCount,
    paginatedItems,
    setPage,
    nextPage: () => setPage((currentPage) => Math.min(currentPage + 1, pageCount)),
    previousPage: () => setPage((currentPage) => Math.max(currentPage - 1, 1)),
  }
}
