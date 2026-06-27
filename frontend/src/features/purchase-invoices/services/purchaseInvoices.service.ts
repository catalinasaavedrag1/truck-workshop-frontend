import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import { getCurrentActorName as resolveCurrentActorName } from '../../../shared/services/sessionUser'
import type { SupplierInvoice } from '../types/supplierInvoice.types'

export interface SupplierInvoicePayload {
  invoiceNumber: string
  supplierId?: string
  supplierName: string
  purchaseOrderId?: string
  purchaseOrderNumber?: string
  status: SupplierInvoice['status']
  invoiceDate: string
  receivedAt?: string
  dueDate: string
  paymentTerms: SupplierInvoice['paymentTerms']
  items: SupplierInvoice['items']
  net: number
  tax: number
  total: number
  approvedBy?: string
  approvedAt?: string
  accountingEntry?: string
  accountedAt?: string
  paidAt?: string
  paymentReference?: string
  notes?: string
}

const PURCHASE_INVOICES_PATH = '/purchase-invoices'

export async function createSupplierInvoice(payload: SupplierInvoicePayload) {
  return createResource<SupplierInvoice, SupplierInvoicePayload>(PURCHASE_INVOICES_PATH, payload)
}

export async function updateSupplierInvoice(invoiceId: string, payload: Partial<SupplierInvoicePayload>) {
  return updateResource<SupplierInvoice, Partial<SupplierInvoicePayload>>(PURCHASE_INVOICES_PATH, invoiceId, payload)
}

export async function deleteSupplierInvoice(invoiceId: string) {
  return deleteResource<SupplierInvoice>(PURCHASE_INVOICES_PATH, invoiceId)
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}
