import { trucksMock } from '../../../mocks/trucks.mock'
import { httpClient } from '../../../shared/services/httpClient'
import { getResourceById, listResource } from '../../../shared/services/resourceApi'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { Truck } from '../types/truck.types'

export async function getTrucks() {
  return listResource<Truck>('/trucks', trucksMock, { sort: 'plate', order: 'asc' })
}

export async function getTruckById(truckId: string) {
  return getResourceById<Truck>('/trucks', truckId, trucksMock)
}

export type CreateTruckPayload = Omit<Truck, 'id'>

export async function createTruck(payload: CreateTruckPayload) {
  const response = await httpClient.post<ApiResponse<Truck>>('/trucks', payload)

  return response.data.data
}
