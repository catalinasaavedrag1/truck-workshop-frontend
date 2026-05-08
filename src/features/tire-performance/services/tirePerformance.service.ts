import { httpClient } from '../../../shared/services/httpClient'
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
  return getSessionUser().name
}

function getActorHeaders() {
  const user = getSessionUser()

  return {
    'x-user-id': user.id,
    'x-user-name': user.name,
  }
}

function getSessionUser() {
  if (typeof window === 'undefined') {
    return { id: 'system', name: 'Sistema' }
  }

  try {
    const session = JSON.parse(localStorage.getItem('truck-workshop-session') || '{}')

    return {
      id: session.user?.id || 'system',
      name: session.user?.name || 'Sistema',
    }
  } catch {
    return { id: 'system', name: 'Sistema' }
  }
}
