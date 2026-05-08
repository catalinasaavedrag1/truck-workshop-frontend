import { useEffect, useState } from 'react'
import { listResource } from '../services/resourceApi'

type QueryParams = Record<string, string | number>

export function useResourceList<T>(path: string, fallback: T[], params: QueryParams = {}) {
  const [data, setData] = useState<T[]>(fallback)
  const [isLoading, setIsLoading] = useState(true)
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    let isMounted = true
    const parsedParams = JSON.parse(paramsKey) as QueryParams

    listResource<T>(path, fallback, parsedParams)
      .then((items) => {
        if (isMounted) {
          setData(items)
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
  }, [fallback, paramsKey, path])

  return { data, isLoading }
}
