import { Badge } from '../../../shared/components/Badge/Badge'
import type { TruckStatus } from '../types/truck.types'
import { truckStatusLabels, truckStatusTones } from '../constants/truck.constants'

interface TruckStatusBadgeProps {
  status: TruckStatus
}

export function TruckStatusBadge({ status }: TruckStatusBadgeProps) {
  return <Badge tone={truckStatusTones[status]}>{truckStatusLabels[status]}</Badge>
}
