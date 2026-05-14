import { Badge } from '../../../shared/components/Badge/Badge'
import {
  FREIGHT_QUOTE_STATUS_LABELS,
  FREIGHT_QUOTE_STATUS_TONES,
  FREIGHT_REQUEST_STATUS_LABELS,
  FREIGHT_REQUEST_STATUS_TONES,
} from '../constants/freightStatus.constants'
import type { FreightQuoteStatus, FreightRequestStatus } from '../types/freight.types'

interface FreightRequestStatusBadgeProps {
  status: FreightRequestStatus | FreightQuoteStatus
  type?: 'request' | 'quote'
}

export function FreightRequestStatusBadge({ status, type = 'request' }: FreightRequestStatusBadgeProps) {
  if (type === 'quote') {
    const quoteStatus = status as FreightQuoteStatus

    return <Badge tone={FREIGHT_QUOTE_STATUS_TONES[quoteStatus]}>{FREIGHT_QUOTE_STATUS_LABELS[quoteStatus]}</Badge>
  }

  const requestStatus = status as FreightRequestStatus

  return (
    <Badge tone={FREIGHT_REQUEST_STATUS_TONES[requestStatus]}>
      {FREIGHT_REQUEST_STATUS_LABELS[requestStatus]}
    </Badge>
  )
}
