import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { LaborTaskStatus } from '../types/labor.types'

const STATUS_LABELS: Record<LaborTaskStatus, string> = {
  done: 'Terminada',
  in_progress: 'En curso',
  pending: 'Pendiente',
}

const STATUS_TONES: Record<LaborTaskStatus, BadgeTone> = {
  done: 'success',
  in_progress: 'info',
  pending: 'neutral',
}

interface LaborTaskStatusBadgeProps {
  status: LaborTaskStatus
}

export function LaborTaskStatusBadge({ status }: LaborTaskStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
