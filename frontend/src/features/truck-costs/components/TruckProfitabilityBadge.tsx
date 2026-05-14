import { Badge } from '../../../shared/components/Badge/Badge'
import { truckProfitabilityLabels, truckProfitabilityTones } from '../constants/truckCosts.constants'
import type { TruckCostSummary } from '../types/truckCosts.types'

interface TruckProfitabilityBadgeProps {
  status: TruckCostSummary['profitabilityStatus']
}

export function TruckProfitabilityBadge({ status }: TruckProfitabilityBadgeProps) {
  return <Badge tone={truckProfitabilityTones[status]}>{truckProfitabilityLabels[status]}</Badge>
}
