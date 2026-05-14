import { httpClient } from '../../../shared/services/httpClient'
import type { TruckCostAnalytics, TruckCostPeriodMode } from '../types/truckCosts.types'

interface ApiResponse<T> {
  data: T
}

interface TruckCostAnalyticsParams {
  month?: number
  period: TruckCostPeriodMode
  truckId?: string
  year: number
}

export async function getTruckCostAnalytics(params: TruckCostAnalyticsParams) {
  const response = await httpClient.get<ApiResponse<TruckCostAnalytics>>('/truck-costs/analytics', {
    params,
  })

  return response.data.data
}
