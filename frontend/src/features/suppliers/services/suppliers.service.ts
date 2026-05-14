import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import type { Supplier } from '../types/supplier.types'

export type SupplierPayload = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

const SUPPLIERS_PATH = '/suppliers'

export async function createSupplier(payload: SupplierPayload) {
  return createResource<Supplier, SupplierPayload>(SUPPLIERS_PATH, payload)
}

export async function updateSupplier(supplierId: string, payload: SupplierPayload) {
  return updateResource<Supplier, SupplierPayload>(SUPPLIERS_PATH, supplierId, payload)
}

export async function deleteSupplier(supplierId: string) {
  return deleteResource<Supplier>(SUPPLIERS_PATH, supplierId)
}
