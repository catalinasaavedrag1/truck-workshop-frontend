import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { QuoteStatus } from '../types/quote.types'

const STATUS_LABELS: Record<QuoteStatus, string> = {
  APPROVED: 'Aprobada',
  DRAFT: 'Borrador',
  EXPIRED: 'Expirada',
  REJECTED: 'Rechazada',
  SENT: 'Enviada',
}

const STATUS_TONES: Record<QuoteStatus, BadgeTone> = {
  APPROVED: 'success',
  DRAFT: 'neutral',
  EXPIRED: 'warning',
  REJECTED: 'danger',
  SENT: 'info',
}

interface QuoteStatusBadgeProps {
  status: QuoteStatus
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
