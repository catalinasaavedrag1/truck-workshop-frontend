import { useCallback, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../services/apiErrorHandler'

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const reset = useCallback(() => {
    setErrorMessage('')
  }, [])

  const run = useCallback(
    async (...args: TArgs) => {
      setIsRunning(true)
      setErrorMessage('')

      try {
        return await action(...args)
      } catch (error) {
        const message = getApiErrorMessage(error)
        setErrorMessage(message)
        throw error
      } finally {
        setIsRunning(false)
      }
    },
    [action],
  )

  return useMemo(
    () => ({
      errorMessage,
      isRunning,
      reset,
      run,
    }),
    [errorMessage, isRunning, reset, run],
  )
}
