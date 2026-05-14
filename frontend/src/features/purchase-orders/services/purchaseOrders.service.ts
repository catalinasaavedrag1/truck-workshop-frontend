import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import { getCurrentActorName as resolveCurrentActorName } from '../../../shared/services/sessionUser'
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../types/purchaseOrder.types'

export interface PurchaseOrderPayload {
  purchaseOrderNumber?: string
  supplierName: string
  status: PurchaseOrderStatus
  relatedCaseId?: string
  requestedBy?: string
  approvedBy?: string
  items: PurchaseOrderItem[]
  totalEstimated?: number
  expectedDeliveryDate: string
}

const PURCHASE_ORDERS_PATH = '/purchase-orders'

export async function createPurchaseOrder(payload: PurchaseOrderPayload) {
  return createResource<PurchaseOrder, PurchaseOrderPayload>(PURCHASE_ORDERS_PATH, payload)
}

export async function updatePurchaseOrder(purchaseOrderId: string, payload: Partial<PurchaseOrderPayload>) {
  return updateResource<PurchaseOrder, Partial<PurchaseOrderPayload>>(PURCHASE_ORDERS_PATH, purchaseOrderId, payload)
}

export async function deletePurchaseOrder(purchaseOrderId: string) {
  return deleteResource<PurchaseOrder>(PURCHASE_ORDERS_PATH, purchaseOrderId)
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}
