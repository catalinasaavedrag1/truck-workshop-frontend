import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { fetchResourceList, resolveMockFallback } from '../services/resourceApi'

type QueryParams = Record<string, string | number>

export function useResourceList<T>(path: string, fallback: T[], params: QueryParams = {}) {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<unknown>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [reloadIndex, setReloadIndex] = useState(0)
  // El fallback suele pasarse como literal (`[]` o un mock), cuya referencia
  // cambia en cada render. Lo guardamos en un ref para que NO sea dependencia del
  // efecto; si no, cada render dispararia un refetch y la vista quedaria en bucle.
  // El ref se actualiza en un efecto (no durante el render) para no romper la
  // regla de React de no mutar refs mientras se renderiza.
  const fallbackRef = useRef(fallback)
  useEffect(() => {
    fallbackRef.current = fallback
  }, [fallback])
  const paramsKey = useMemo(() => JSON.stringify(params), [params])
  const requestKey = `${path}:${paramsKey}`
  const [settledRequestKey, setSettledRequestKey] = useState('')
  const reload = useCallback(() => {
    setSettledRequestKey('')
    setReloadIndex((current) => current + 1)
  }, [])

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
          const fallbackData = resolveMockFallback(path, fallbackRef.current, requestError)

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
  }, [paramsKey, path, reloadIndex, requestKey])

  const isLoading = settledRequestKey !== requestKey

  return { data, error: isLoading ? null : error, isFallback: isLoading ? false : isFallback, isLoading, reload }
}
