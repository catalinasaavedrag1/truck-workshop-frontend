import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightInvoiceStatus } from '../types/freightInvoice.types'

const FREIGHT_INVOICE_STATUS_LABELS: Record<FreightInvoiceStatus, string> = {
  ISSUED: 'Emitida',
  SENT: 'Enviada',
  APPROVED: 'Aprobada cliente',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  CANCELLED: 'Anulada',
}

const STATUS_TONES: Record<FreightInvoiceStatus, BadgeTone> = {
  ISSUED: 'neutral',
  SENT: 'info',
  APPROVED: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'danger',
}

interface FreightInvoiceStatusBadgeProps {
  status: FreightInvoiceStatus
}

export function FreightInvoiceStatusBadge({ status }: FreightInvoiceStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{FREIGHT_INVOICE_STATUS_LABELS[status]}</Badge>
}
