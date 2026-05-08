import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { ApprovalStatus } from '../types/approval.types'

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  approved: 'Aprobada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
}

const STATUS_TONES: Record<ApprovalStatus, BadgeTone> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
}

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
