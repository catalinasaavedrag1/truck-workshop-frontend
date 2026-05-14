import { Badge } from '../../../shared/components/Badge/Badge'
import { fuelDeviationLabels, fuelDeviationTones } from '../constants/fuel.constants'
import type { FuelDeviationStatus } from '../types/fuel.types'

interface FuelDeviationBadgeProps {
  status: FuelDeviationStatus
}

export function FuelDeviationBadge({ status }: FuelDeviationBadgeProps) {
  return <Badge tone={fuelDeviationTones[status]}>{fuelDeviationLabels[status]}</Badge>
}
