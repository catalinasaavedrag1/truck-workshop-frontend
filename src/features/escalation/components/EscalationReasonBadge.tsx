import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { EscalationReason } from '../types/escalation.types'
import { ESCALATION_REASON_LABELS } from '../constants/escalation.constants'

const REASON_TONES: Record<EscalationReason, BadgeTone> = {
  CRITICAL_PART_MISSING: 'danger',
  CUSTOMER_COMPLAINT: 'warning',
  DIAGNOSIS_BLOCKED: 'warning',
  MECHANIC_UNAVAILABLE: 'info',
  SLA_AT_RISK: 'warning',
  SLA_BREACHED: 'danger',
  SPECIAL_AUTHORIZATION: 'info',
}

interface EscalationReasonBadgeProps {
  reason: EscalationReason
}

export function EscalationReasonBadge({ reason }: EscalationReasonBadgeProps) {
  return <Badge tone={REASON_TONES[reason]}>{ESCALATION_REASON_LABELS[reason]}</Badge>
}
