import { httpClient } from '../../../shared/services/httpClient'
import { getActorHeaders } from '../../../shared/services/sessionUser'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { WarehouseLocation } from '../types/warehouse.types'

export type WarehouseLocationPayload = Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

export async function createWarehouseLocation(payload: WarehouseLocationPayload) {
  const response = await httpClient.post<ApiResponse<WarehouseLocation>>('/warehouse/locations', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updateWarehouseLocation(locationId: string, payload: WarehouseLocationPayload) {
  const response = await httpClient.patch<ApiResponse<WarehouseLocation>>(`/warehouse/locations/${locationId}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deleteWarehouseLocation(locationId: string) {
  const response = await httpClient.delete<ApiResponse<WarehouseLocation>>(`/warehouse/locations/${locationId}`, {
    headers: getActorHeaders(),
  })

  return response.data.data
}
