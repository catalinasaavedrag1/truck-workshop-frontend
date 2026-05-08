import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { SlaStatus } from '../types/sla.types'

const SLA_LABELS: Record<SlaStatus, string> = {
  AT_RISK: 'SLA en riesgo',
  BREACHED: 'SLA vencido',
  OK: 'SLA OK',
}

const SLA_TONES: Record<SlaStatus, BadgeTone> = {
  AT_RISK: 'warning',
  BREACHED: 'danger',
  OK: 'success',
}

interface SlaBadgeProps {
  status: SlaStatus
}

export function SlaBadge({ status }: SlaBadgeProps) {
  return <Badge tone={SLA_TONES[status]}>{SLA_LABELS[status]}</Badge>
}
