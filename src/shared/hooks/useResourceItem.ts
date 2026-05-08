import { useEffect, useState } from 'react'
import { getResourceById } from '../services/resourceApi'

export function useResourceItem<T extends { id: string }>(path: string, id: string | undefined, fallback: T[]) {
  const [data, setData] = useState<T | undefined>(() => fallback.find((item) => item.id === id))
  const [isLoading, setIsLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      return undefined
    }

    let isMounted = true

    getResourceById<T>(path, id, fallback)
      .then((item) => {
        if (isMounted) {
          setData(item)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [fallback, id, path])

  return { data, isLoading }
}
