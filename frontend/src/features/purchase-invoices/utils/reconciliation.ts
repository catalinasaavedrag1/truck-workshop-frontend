import type { SupplierInvoice, SupplierInvoiceItem } from '../types/supplierInvoice.types'

export const IVA_RATE = 0.19

export interface ReconciliationLine extends SupplierInvoiceItem {
  amount: number
  quantityMatch: boolean
}

export interface ReconciliationResult {
  lines: ReconciliationLine[]
  net: number
  tax: number
  total: number
  quantityMatch: boolean
  hasDifference: boolean
}

/**
 * Conciliacion 3-way: compara, por linea, la cantidad de la OC, la recibida y la
 * facturada. Hay diferencia si alguna linea no calza en cantidades.
 */
export function reconcileInvoice(items: SupplierInvoiceItem[]): ReconciliationResult {
  const lines: ReconciliationLine[] = items.map((item) => ({
    ...item,
    amount: item.invoicedQuantity * item.unitPrice,
    quantityMatch: item.orderedQuantity === item.receivedQuantity && item.receivedQuantity === item.invoicedQuantity,
  }))

  const net = lines.reduce((total, line) => total + line.amount, 0)
  const tax = Math.round(net * IVA_RATE)
  const quantityMatch = lines.every((line) => line.quantityMatch)

  return {
    lines,
    net,
    tax,
    total: net + tax,
    quantityMatch,
    hasDifference: !quantityMatch,
  }
}

export function computeInvoiceTotals(items: SupplierInvoiceItem[]) {
  const net = items.reduce((total, item) => total + item.invoicedQuantity * item.unitPrice, 0)
  const tax = Math.round(net * IVA_RATE)
  return { net, tax, total: net + tax }
}

const TERMS_DAYS: Record<SupplierInvoice['paymentTerms'], number> = {
  CONTADO: 0,
  DIAS_15: 15,
  DIAS_30: 30,
  DIAS_60: 60,
}

export function resolveDueDate(invoiceDate: string, terms: SupplierInvoice['paymentTerms']) {
  const base = new Date(invoiceDate)

  if (Number.isNaN(base.getTime())) {
    return invoiceDate
  }

  base.setDate(base.getDate() + (TERMS_DAYS[terms] ?? 0))
  return base.toISOString()
}
