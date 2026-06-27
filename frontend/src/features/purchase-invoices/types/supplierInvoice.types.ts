// Factura de compra (proveedor) — cuentas por pagar.
// Flujo: Registrada -> Conciliada (3-way OC+Recepcion+Factura) -> Aprobada
//        -> Contabilizada (registro contable) -> Pagada.
export type SupplierInvoiceStatus =
  | 'REGISTERED'
  | 'RECONCILED'
  | 'WITH_DIFFERENCE'
  | 'APPROVED'
  | 'ACCOUNTED'
  | 'PAID'
  | 'CANCELLED'

export type SupplierPaymentTerms = 'CONTADO' | 'DIAS_15' | 'DIAS_30' | 'DIAS_60'

export interface SupplierInvoiceItem {
  sku: string
  name: string
  /** Cantidad de la Orden de Compra. */
  orderedQuantity: number
  /** Cantidad efectivamente recibida (Recepcion). */
  receivedQuantity: number
  /** Cantidad facturada por el proveedor. */
  invoicedQuantity: number
  /** Precio unitario facturado. */
  unitPrice: number
}

export interface SupplierInvoice {
  id: string
  /** Folio de la factura del proveedor. */
  invoiceNumber: string
  supplierId?: string
  supplierName: string
  purchaseOrderId?: string
  purchaseOrderNumber?: string
  status: SupplierInvoiceStatus
  invoiceDate: string
  receivedAt?: string
  dueDate: string
  paymentTerms: SupplierPaymentTerms
  items: SupplierInvoiceItem[]
  net: number
  tax: number
  total: number
  approvedBy?: string
  approvedAt?: string
  /** Numero de asiento del registro contable. */
  accountingEntry?: string
  accountedAt?: string
  paidAt?: string
  paymentReference?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}
