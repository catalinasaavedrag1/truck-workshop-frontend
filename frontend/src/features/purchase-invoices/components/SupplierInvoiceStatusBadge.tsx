import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { SupplierInvoiceStatus } from '../types/supplierInvoice.types'

const SUPPLIER_INVOICE_STATUS_LABELS: Record<SupplierInvoiceStatus, string> = {
  REGISTERED: 'Registrada',
  RECONCILED: 'Conciliada',
  WITH_DIFFERENCE: 'Con diferencia',
  APPROVED: 'Aprobada',
  ACCOUNTED: 'Contabilizada',
  PAID: 'Pagada',
  CANCELLED: 'Anulada',
}

const STATUS_TONES: Record<SupplierInvoiceStatus, BadgeTone> = {
  REGISTERED: 'neutral',
  RECONCILED: 'info',
  WITH_DIFFERENCE: 'warning',
  APPROVED: 'info',
  ACCOUNTED: 'info',
  PAID: 'success',
  CANCELLED: 'danger',
}

interface SupplierInvoiceStatusBadgeProps {
  status: SupplierInvoiceStatus
}

export function SupplierInvoiceStatusBadge({ status }: SupplierInvoiceStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{SUPPLIER_INVOICE_STATUS_LABELS[status]}</Badge>
}
