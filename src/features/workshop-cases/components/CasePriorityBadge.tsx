import { Badge } from '../../../shared/components/Badge/Badge'
import {
  CASE_PRIORITY_LABELS,
  CASE_PRIORITY_TONES,
} from '../constants/casePriority.constants'
import type { WorkshopCasePriority } from '../types/workshopCase.types'

interface CasePriorityBadgeProps {
  priority: WorkshopCasePriority
}

export function CasePriorityBadge({ priority }: CasePriorityBadgeProps) {
  return <Badge tone={CASE_PRIORITY_TONES[priority]}>{CASE_PRIORITY_LABELS[priority]}</Badge>
}
