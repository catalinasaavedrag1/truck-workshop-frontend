import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
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

export async function createPurchaseOrder(payload: PurchaseOrderPayload) {
  const response = await httpClient.post<ApiResponse<PurchaseOrder>>('/purchase-orders', payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function updatePurchaseOrder(purchaseOrderId: string, payload: Partial<PurchaseOrderPayload>) {
  const response = await httpClient.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${purchaseOrderId}`, payload, {
    headers: getActorHeaders(),
  })

  return response.data.data
}

export async function deletePurchaseOrder(purchaseOrderId: string) {
  const response = await httpClient.delete<ApiResponse<PurchaseOrder>>(`/purchase-orders/${purchaseOrderId}`, {
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
