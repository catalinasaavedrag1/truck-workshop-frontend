import { Badge } from '../../../shared/components/Badge/Badge'
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_TONES,
} from '../constants/caseStatus.constants'
import type { WorkshopCaseStatus } from '../types/workshopCase.types'

interface CaseStatusBadgeProps {
  status: WorkshopCaseStatus
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  return <Badge tone={CASE_STATUS_TONES[status]}>{CASE_STATUS_LABELS[status]}</Badge>
}
