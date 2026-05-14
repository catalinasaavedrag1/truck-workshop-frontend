import { useEffect, useState } from 'react'
import axios from 'axios'
import { fetchResourceList, resolveMockFallback } from '../services/resourceApi'

type QueryParams = Record<string, string | number>

export function useResourceList<T>(path: string, fallback: T[], params: QueryParams = {}) {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<unknown>(null)
  const [isFallback, setIsFallback] = useState(false)
  const paramsKey = JSON.stringify(params)
  const requestKey = `${path}:${paramsKey}`
  const [settledRequestKey, setSettledRequestKey] = useState('')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const parsedParams = JSON.parse(paramsKey) as QueryParams

    fetchResourceList<T>(path, parsedParams, { signal: controller.signal })
      .then((items) => {
        if (isMounted) {
          setData(items)
          setError(null)
          setIsFallback(false)
        }
      })
      .catch((requestError) => {
        if (!isMounted || axios.isCancel(requestError)) {
          return
        }

        try {
          const fallbackData = resolveMockFallback(path, fallback, requestError)

          setError(null)
          setIsFallback(true)
          setData(fallbackData)
        } catch (fallbackError) {
          setError(fallbackError)
          setIsFallback(false)
          setData([])
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
  }, [fallback, paramsKey, path, requestKey])

  const isLoading = settledRequestKey !== requestKey

  return { data, error: isLoading ? null : error, isFallback: isLoading ? false : isFallback, isLoading }
}
