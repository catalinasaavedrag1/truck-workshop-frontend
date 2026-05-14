import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { listDiagnosticsByCase } from '../services/diagnostics.service'
import type { Diagnostic } from '../types/diagnostic.types'

export function useCaseDiagnostics(caseId?: string) {
  const [data, setData] = useState<Diagnostic[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(caseId))

  const refresh = useCallback(async () => {
    if (!caseId) {
      setData([])
      setIsLoading(false)
      setErrorMessage('')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      setData(await listDiagnosticsByCase(caseId))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  const prepend = useCallback((diagnostic: Diagnostic) => {
    setData((currentData) => [diagnostic, ...currentData.filter((item) => item.id !== diagnostic.id)])
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!caseId) {
      void Promise.resolve().then(() => {
        if (isMounted) {
          setData([])
          setIsLoading(false)
          setErrorMessage('')
        }
      })

      return () => {
        isMounted = false
      }
    }

    void Promise.resolve().then(() => {
      if (isMounted) {
        setIsLoading(true)
        setErrorMessage('')
      }
    })

    listDiagnosticsByCase(caseId)
      .then((diagnostics) => {
        if (isMounted) {
          setData(diagnostics)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error))
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
  }, [caseId])

  return {
    data,
    errorMessage,
    isLoading,
    prepend,
    refresh,
  }
}
