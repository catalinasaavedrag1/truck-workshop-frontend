export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CLOSED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'ANNULLED'
  | 'WITH_DIFFERENCE'
  | 'DOCUMENT_BLOCKED'

export interface PurchaseOrderItem {
  partId: string
  sku: string
  name: string
  quantity: number
  estimatedUnitCost: number
  requiredForCaseId?: string
}

export interface PurchaseOrder {
  id: string
  purchaseOrderNumber: string
  supplierName: string
  status: PurchaseOrderStatus
  relatedCaseId?: string
  requestedBy: string
  approvedBy?: string
  items: PurchaseOrderItem[]
  totalEstimated: number
  createdAt: string
  expectedDeliveryDate: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}

export type PurchaseRequestStatus = 'open' | 'linked_to_po' | 'received' | 'cancelled'

export interface PurchaseRequest {
  id: string
  caseId: string
  partId: string
  sku: string
  name: string
  quantity: number
  requestedBy: string
  status: PurchaseRequestStatus
  purchaseOrderId?: string
  createdAt: string
}
