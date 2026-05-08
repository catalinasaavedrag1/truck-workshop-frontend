import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { FREIGHT_ASSIGNMENT_STATUS_LABELS } from '../constants/freightStatus.constants'
import type { FreightAssignmentStatus } from '../types/freight.types'

const ASSIGNMENT_TONES: Record<FreightAssignmentStatus, BadgeTone> = {
  CANCELLED: 'danger',
  DELIVERED: 'success',
  IN_TRANSIT: 'warning',
  SCHEDULED: 'info',
}

interface FreightAssignmentStatusBadgeProps {
  status: FreightAssignmentStatus
}

export function FreightAssignmentStatusBadge({ status }: FreightAssignmentStatusBadgeProps) {
  return <Badge tone={ASSIGNMENT_TONES[status]}>{FREIGHT_ASSIGNMENT_STATUS_LABELS[status]}</Badge>
}
