import { Badge } from '../../../shared/components/Badge/Badge'
import type { ApprovalType } from '../types/approval.types'

const TYPE_LABELS: Record<ApprovalType, string> = {
  discount: 'Descuento',
  forced_close: 'Cierre forzado',
  purchase: 'Compra',
  quote: 'Cotizacion',
  repair: 'Reparacion',
}

interface ApprovalTypeBadgeProps {
  type: ApprovalType
}

export function ApprovalTypeBadge({ type }: ApprovalTypeBadgeProps) {
  return <Badge tone="info">{TYPE_LABELS[type]}</Badge>
}
