import { Badge } from '../../../shared/components/Badge/Badge'
import { TIRE_POSITION_LABELS } from '../constants/tirePerformance.constants'
import type { TirePosition } from '../types/tirePerformance.types'

interface TirePositionBadgeProps {
  position?: TirePosition
}

export function TirePositionBadge({ position }: TirePositionBadgeProps) {
  return <Badge tone="neutral">{position ? TIRE_POSITION_LABELS[position] : 'Sin posicion'}</Badge>
}
