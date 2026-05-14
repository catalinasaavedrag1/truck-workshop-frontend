import { Badge } from '../../../shared/components/Badge/Badge'
import { TIRE_STATUS_LABELS, TIRE_STATUS_TONES } from '../constants/tirePerformance.constants'
import type { TireLifecycleStatus } from '../types/tirePerformance.types'

interface TireStatusBadgeProps {
  status: TireLifecycleStatus
}

export function TireStatusBadge({ status }: TireStatusBadgeProps) {
  return <Badge tone={TIRE_STATUS_TONES[status]}>{TIRE_STATUS_LABELS[status]}</Badge>
}
