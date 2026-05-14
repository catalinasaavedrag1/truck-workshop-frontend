import { useEffect, useState } from 'react'
import axios from 'axios'
import { fetchResourceById, resolveMockFallback } from '../services/resourceApi'

export function useResourceItem<T extends { id: string }>(path: string, id: string | undefined, fallback: T[]) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [isFallback, setIsFallback] = useState(false)
  const requestKey = id ? `${path}:${id}` : ''
  const [settledRequestKey, setSettledRequestKey] = useState('')

  useEffect(() => {
    if (!id) {
      return undefined
    }

    let isMounted = true
    const controller = new AbortController()

    fetchResourceById<T>(path, id, { signal: controller.signal })
      .then((item) => {
        if (isMounted) {
          setData(item)
          setError(null)
          setIsFallback(false)
        }
      })
      .catch((requestError) => {
        if (!isMounted || axios.isCancel(requestError)) {
          return
        }

        try {
          const fallbackData = resolveMockFallback(`${path}/${id}`, fallback, requestError)

          setError(null)
          setIsFallback(true)
          setData(fallbackData.find((item) => item.id === id))
        } catch (fallbackError) {
          setError(fallbackError)
          setIsFallback(false)
          setData(undefined)
        }
      })
      .finally(() => {
        if (isMounted) {
          setSettledRequestKey(requestKey)
        }
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [fallback, id, path, requestKey])

  const isLoading = Boolean(id) && settledRequestKey !== requestKey

  return { data, error: isLoading ? null : error, isFallback: isLoading ? false : isFallback, isLoading }
}
