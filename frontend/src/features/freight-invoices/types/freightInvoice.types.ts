// Factura de fletes a cliente — cuentas por cobrar.
// Flujo: Emitida -> Enviada (con respaldos) -> Aprobada por el cliente -> Pagada.
// Soporta facturacion CONSOLIDADA: varios fletes del periodo en una factura.
export type FreightInvoiceStatus = 'ISSUED' | 'SENT' | 'APPROVED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export type FreightPaymentTerms = 'CONTADO' | 'DIAS_15' | 'DIAS_30' | 'DIAS_60'

export type FreightInvoiceLineKind = 'FREIGHT' | 'SURCHARGE'

export interface FreightInvoiceLine {
  date: string
  description: string
  /** Numero de la solicitud / orden de transporte (FLE-...). */
  reference?: string
  freightRequestId?: string
  kind: FreightInvoiceLineKind
  /** Valor neto de la linea. */
  amount: number
}

export interface FreightInvoice {
  id: string
  invoiceNumber: string
  customerId?: string
  customerName: string
  status: FreightInvoiceStatus
  issueDate: string
  dueDate: string
  paymentTerms: FreightPaymentTerms
  /** Periodo consolidado (ej: semana o mes). */
  periodStart?: string
  periodEnd?: string
  lines: FreightInvoiceLine[]
  /** Respaldos: carta de porte, comprobante de entrega, registro GPS, docs del puerto. */
  backupDocuments: string[]
  net: number
  tax: number
  total: number
  sentAt?: string
  approvedAt?: string
  /** Contacto del cliente que aprueba la factura. */
  approvedBy?: string
  paidAt?: string
  paymentReference?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}
