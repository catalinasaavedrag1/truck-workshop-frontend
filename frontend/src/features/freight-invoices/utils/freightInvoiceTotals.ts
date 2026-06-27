import type { FreightInvoice, FreightInvoiceLine } from '../types/freightInvoice.types'

export const IVA_RATE = 0.19

/** Tarifa referencial por km para estimar el valor de un flete al consolidar. */
export const FREIGHT_RATE_PER_KM = 1500

export function computeFreightInvoiceTotals(lines: FreightInvoiceLine[]) {
  const net = lines.reduce((total, line) => total + line.amount, 0)
  const tax = Math.round(net * IVA_RATE)
  return { net, tax, total: net + tax }
}

const TERMS_DAYS: Record<FreightInvoice['paymentTerms'], number> = {
  CONTADO: 0,
  DIAS_15: 15,
  DIAS_30: 30,
  DIAS_60: 60,
}

export function resolveDueDate(issueDate: string, terms: FreightInvoice['paymentTerms']) {
  const base = new Date(issueDate)

  if (Number.isNaN(base.getTime())) {
    return issueDate
  }

  base.setDate(base.getDate() + (TERMS_DAYS[terms] ?? 0))
  return base.toISOString()
}
