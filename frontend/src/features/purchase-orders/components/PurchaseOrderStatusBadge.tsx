import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { PurchaseOrderStatus } from '../types/purchaseOrder.types'

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  APPROVED: 'Aprobada',
  ANNULLED: 'Anulada',
  CANCELLED: 'Cancelada',
  CLOSED: 'Cerrada',
  DOCUMENT_BLOCKED: 'Bloqueada por documento',
  DRAFT: 'Borrador',
  ORDERED: 'Ordenada',
  OVERDUE: 'Atrasada',
  PARTIALLY_RECEIVED: 'Recepcion parcial',
  PENDING_APPROVAL: 'En aprobacion',
  RECEIVED: 'Recibida',
  REQUESTED: 'Solicitada',
  WITH_DIFFERENCE: 'Con diferencia',
}

const STATUS_TONES: Record<PurchaseOrderStatus, BadgeTone> = {
  APPROVED: 'info',
  ANNULLED: 'danger',
  CANCELLED: 'danger',
  CLOSED: 'success',
  DOCUMENT_BLOCKED: 'warning',
  DRAFT: 'neutral',
  ORDERED: 'warning',
  OVERDUE: 'danger',
  PARTIALLY_RECEIVED: 'warning',
  PENDING_APPROVAL: 'info',
  RECEIVED: 'success',
  REQUESTED: 'info',
  WITH_DIFFERENCE: 'warning',
}

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus
}

export function PurchaseOrderStatusBadge({ status }: PurchaseOrderStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
