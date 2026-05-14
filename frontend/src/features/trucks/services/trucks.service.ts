import { trucksMock } from '../../../mocks/trucks.mock'
import { createResource, getResourceById, listResource } from '../../../shared/services/resourceApi'
import type { Truck } from '../types/truck.types'

const TRUCKS_PATH = '/trucks'

export async function getTrucks() {
  return listResource<Truck>(TRUCKS_PATH, trucksMock, { sort: 'plate', order: 'asc' })
}

export async function getTruckById(truckId: string) {
  return getResourceById<Truck>(TRUCKS_PATH, truckId, trucksMock)
}

export type CreateTruckPayload = Omit<Truck, 'id'>

export async function createTruck(payload: CreateTruckPayload) {
  return createResource<Truck, CreateTruckPayload>(TRUCKS_PATH, payload)
}
