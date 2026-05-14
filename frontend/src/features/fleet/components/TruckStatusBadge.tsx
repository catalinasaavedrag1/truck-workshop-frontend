import { Badge } from '../../../shared/components/Badge/Badge'
import { operationalStatusLabels, operationalStatusTones } from '../constants/fleet.constants'
import type { OperationalTruckStatus } from '../types/fleet.types'

interface TruckStatusBadgeProps {
  status: OperationalTruckStatus
}

export function TruckStatusBadge({ status }: TruckStatusBadgeProps) {
  return <Badge tone={operationalStatusTones[status]}>{operationalStatusLabels[status]}</Badge>
}
