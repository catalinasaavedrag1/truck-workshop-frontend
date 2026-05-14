import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import type { WarehouseLocation } from '../types/warehouse.types'

export type WarehouseLocationPayload = Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

const WAREHOUSE_LOCATIONS_PATH = '/warehouse/locations'

export async function createWarehouseLocation(payload: WarehouseLocationPayload) {
  return createResource<WarehouseLocation, WarehouseLocationPayload>(WAREHOUSE_LOCATIONS_PATH, payload)
}

export async function updateWarehouseLocation(locationId: string, payload: WarehouseLocationPayload) {
  return updateResource<WarehouseLocation, WarehouseLocationPayload>(WAREHOUSE_LOCATIONS_PATH, locationId, payload)
}

export async function deleteWarehouseLocation(locationId: string) {
  return deleteResource<WarehouseLocation>(WAREHOUSE_LOCATIONS_PATH, locationId)
}
