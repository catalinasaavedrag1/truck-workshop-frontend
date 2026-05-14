import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { WorkshopBayStatus } from '../types/workshopBay.types'

const STATUS_LABELS: Record<WorkshopBayStatus, string> = {
  available: 'Disponible',
  maintenance: 'Mantencion',
  occupied: 'Ocupada',
}

const STATUS_TONES: Record<WorkshopBayStatus, BadgeTone> = {
  available: 'success',
  maintenance: 'warning',
  occupied: 'info',
}

interface BayStatusBadgeProps {
  status: WorkshopBayStatus
}

export function BayStatusBadge({ status }: BayStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
