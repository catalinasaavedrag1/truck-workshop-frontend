import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { Driver } from '../types/driver.types'

export type CreateDriverPayload = Omit<Driver, 'id' | 'createdAt'>

export async function createDriver(payload: CreateDriverPayload) {
  const response = await httpClient.post<ApiResponse<Driver>>('/drivers', payload)

  return response.data.data
}

export async function updateDriver(driverId: string, payload: CreateDriverPayload) {
  const response = await httpClient.patch<ApiResponse<Driver>>(`/drivers/${driverId}`, payload)

  return response.data.data
}
