import { createResource, updateResource } from '../../../shared/services/resourceApi'
import type { Driver } from '../types/driver.types'

export type CreateDriverPayload = Omit<Driver, 'id' | 'createdAt'>

const DRIVERS_PATH = '/drivers'

export async function createDriver(payload: CreateDriverPayload) {
  return createResource<Driver, CreateDriverPayload>(DRIVERS_PATH, payload)
}

export async function updateDriver(driverId: string, payload: CreateDriverPayload) {
  return updateResource<Driver, CreateDriverPayload>(DRIVERS_PATH, driverId, payload)
}
