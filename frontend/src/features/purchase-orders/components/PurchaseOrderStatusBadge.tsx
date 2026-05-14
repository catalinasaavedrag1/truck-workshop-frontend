import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { PurchaseOrderStatus } from '../types/purchaseOrder.types'

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  APPROVED: 'Aprobada',
  CANCELLED: 'Cancelada',
  DRAFT: 'Borrador',
  ORDERED: 'Ordenada',
  PARTIALLY_RECEIVED: 'Recepcion parcial',
  RECEIVED: 'Recibida',
  REQUESTED: 'Solicitada',
}

const STATUS_TONES: Record<PurchaseOrderStatus, BadgeTone> = {
  APPROVED: 'info',
  CANCELLED: 'danger',
  DRAFT: 'neutral',
  ORDERED: 'warning',
  PARTIALLY_RECEIVED: 'warning',
  RECEIVED: 'success',
  REQUESTED: 'info',
}

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus
}

export function PurchaseOrderStatusBadge({ status }: PurchaseOrderStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
