import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { FuelPriceSnapshot } from '../types/fuel.types'

interface FuelPriceQuery {
  fuelType?: string
  regionCode?: string
}

export async function getCurrentFuelPrice(query: FuelPriceQuery = {}) {
  const response = await httpClient.get<ApiResponse<FuelPriceSnapshot>>('/fuel/prices/current', {
    params: {
      fuelType: query.fuelType || 'DIESEL',
      regionCode: query.regionCode || '13',
    },
  })

  return response.data.data
}

export async function syncFuelPrices() {
  const response = await httpClient.post<ApiResponse<{ records: FuelPriceSnapshot[]; syncedAt: string; total: number }>>('/fuel/prices/sync', {})

  return response.data.data
}
