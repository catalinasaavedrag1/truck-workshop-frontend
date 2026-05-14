import { useCallback, useMemo, useState } from 'react'

export function useSelection(initialIds: Iterable<string> = []) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialIds))

  const selectedCount = selectedIds.size

  const clear = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const replace = useCallback((ids: Iterable<string>) => {
    setSelectedIds(new Set(ids))
  }, [])

  const selectMany = useCallback((ids: Iterable<string>) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)
      Array.from(ids).forEach((id) => nextIds.add(id))
      return nextIds
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(id)) {
        nextIds.delete(id)
      } else {
        nextIds.add(id)
      }

      return nextIds
    })
  }, [])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  return useMemo(
    () => ({
      clear,
      isSelected,
      replace,
      selectMany,
      selectedCount,
      selectedIds,
      setSelectedIds,
      toggle,
    }),
    [clear, isSelected, replace, selectMany, selectedCount, selectedIds, toggle],
  )
}
