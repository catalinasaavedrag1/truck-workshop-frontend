import { Badge } from '../../../shared/components/Badge/Badge'
import type { FreightRequest } from '../types/freight.types'
import { getFreightPriority } from '../utils/freightOperations'

interface FreightPriorityBadgeProps {
  request: FreightRequest
}

export function FreightPriorityBadge({ request }: FreightPriorityBadgeProps) {
  const priority = getFreightPriority(request)

  return <Badge tone={priority.tone}>{priority.label}</Badge>
}
