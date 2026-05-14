import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import type { FuelPriceSnapshot } from '../types/fuel.types'
import { getCurrentFuelPrice, syncFuelPrices } from '../services/fuelPrices.service'

interface UseFuelPriceOptions {
  fuelType?: string
  regionCode?: string
}

export function useFuelPrice({ fuelType = 'DIESEL', regionCode = '13' }: UseFuelPriceOptions = {}) {
  const [fuelPrice, setFuelPrice] = useState<FuelPriceSnapshot | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    let isMounted = true

    getCurrentFuelPrice({ fuelType, regionCode })
      .then((snapshot) => {
        if (isMounted) {
          setFuelPrice(snapshot)
          setErrorMessage('')
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
  }, [fuelType, regionCode])

  const refresh = async (forceSync = false) => {
    setIsSyncing(forceSync)
    setErrorMessage('')

    try {
      if (forceSync) {
        await syncFuelPrices()
      }

      const snapshot = await getCurrentFuelPrice({ fuelType, regionCode })
      setFuelPrice(snapshot)

      return snapshot
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))

      try {
        const snapshot = await getCurrentFuelPrice({ fuelType, regionCode })
        setFuelPrice(snapshot)

        return snapshot
      } catch {
        return null
      }
    } finally {
      setIsSyncing(false)
      setIsLoading(false)
    }
  }

  return {
    errorMessage,
    fuelPrice,
    isLoading,
    isSyncing,
    refresh,
  }
}
