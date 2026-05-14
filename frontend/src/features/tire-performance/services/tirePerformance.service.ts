import { httpClient } from '../../../shared/services/httpClient'
import {
  getActorHeaders,
  getCurrentActorName as resolveCurrentActorName,
} from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type {
  TireInstallPayload,
  TireLifecycle,
  TireRemovePayload,
  TireStockIntakePayload,
} from '../types/tirePerformance.types'

export async function createTireStockBatch(payload: TireStockIntakePayload) {
  const response = await httpClient.post<ApiResponse<TireLifecycle[]>>('/tire-performance/tires/intake', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function installTire(tireId: string, payload: TireInstallPayload) {
  const response = await httpClient.post<ApiResponse<TireLifecycle>>(`/tire-performance/tires/${tireId}/install`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function removeTire(tireId: string, payload: TireRemovePayload) {
  const response = await httpClient.post<ApiResponse<TireLifecycle>>(`/tire-performance/tires/${tireId}/remove`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}
