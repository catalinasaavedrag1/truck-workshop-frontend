import { createResource, deleteResource, updateResource } from '../../../shared/services/resourceApi'
import { getCurrentActorName as resolveCurrentActorName } from '../../../shared/services/sessionUser'
import type { FreightInvoice } from '../types/freightInvoice.types'

export interface FreightInvoicePayload {
  invoiceNumber: string
  customerId?: string
  customerName: string
  status: FreightInvoice['status']
  issueDate: string
  dueDate: string
  paymentTerms: FreightInvoice['paymentTerms']
  periodStart?: string
  periodEnd?: string
  lines: FreightInvoice['lines']
  backupDocuments: string[]
  net: number
  tax: number
  total: number
  sentAt?: string
  approvedAt?: string
  approvedBy?: string
  paidAt?: string
  paymentReference?: string
  notes?: string
}

const FREIGHT_INVOICES_PATH = '/freight-invoices'

export async function createFreightInvoice(payload: FreightInvoicePayload) {
  return createResource<FreightInvoice, FreightInvoicePayload>(FREIGHT_INVOICES_PATH, payload)
}

export async function updateFreightInvoice(invoiceId: string, payload: Partial<FreightInvoicePayload>) {
  return updateResource<FreightInvoice, Partial<FreightInvoicePayload>>(FREIGHT_INVOICES_PATH, invoiceId, payload)
}

export async function deleteFreightInvoice(invoiceId: string) {
  return deleteResource<FreightInvoice>(FREIGHT_INVOICES_PATH, invoiceId)
}

export function getCurrentActorName() {
  return resolveCurrentActorName()
}
