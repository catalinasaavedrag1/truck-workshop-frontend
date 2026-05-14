import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { ScheduleEventStatus } from '../types/schedule.types'

const STATUS_LABELS: Record<ScheduleEventStatus, string> = {
  blocked: 'Bloqueado',
  done: 'Terminado',
  in_progress: 'En curso',
  scheduled: 'Programado',
  waiting_parts: 'Espera repuestos',
}

const STATUS_TONES: Record<ScheduleEventStatus, BadgeTone> = {
  blocked: 'danger',
  done: 'success',
  in_progress: 'info',
  scheduled: 'neutral',
  waiting_parts: 'warning',
}

interface ScheduleStatusBadgeProps {
  status: ScheduleEventStatus
}

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
