import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { QuoteStatus } from '../types/quote.types'
import { QUOTE_STATUS_LABELS } from '../constants/quoteStatus.constants'

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
  return <Badge tone={STATUS_TONES[status]}>{QUOTE_STATUS_LABELS[status]}</Badge>
}
