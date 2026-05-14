import { useCallback, useMemo, useState } from 'react'

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)

  const normalizedQuery = useMemo(() => normalizeSearchText(query.trim()), [query])

  const clearSearch = useCallback(() => {
    setQuery('')
  }, [])

  const matches = useCallback(
    (value: unknown) => {
      if (!normalizedQuery) {
        return true
      }

      return normalizeSearchText(JSON.stringify(value ?? '')).includes(normalizedQuery)
    },
    [normalizedQuery],
  )

  return useMemo(
    () => ({
      clearSearch,
      matches,
      normalizedQuery,
      query,
      setQuery,
    }),
    [clearSearch, matches, normalizedQuery, query],
  )
}
