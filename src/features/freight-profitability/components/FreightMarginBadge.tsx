import { Badge } from '../../../shared/components/Badge/Badge'
import {
  freightMarginLabels,
  freightMarginTones,
  getFreightMarginStatus,
} from '../constants/freightProfitability.constants'

interface FreightMarginBadgeProps {
  marginPercentage: number
}

export function FreightMarginBadge({ marginPercentage }: FreightMarginBadgeProps) {
  const status = getFreightMarginStatus(marginPercentage)

  return <Badge tone={freightMarginTones[status]}>{freightMarginLabels[status]}</Badge>
}
