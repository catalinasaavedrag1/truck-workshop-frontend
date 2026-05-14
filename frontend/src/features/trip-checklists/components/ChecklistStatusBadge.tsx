import { Badge } from '../../../shared/components/Badge/Badge'
import { checklistStatusLabels, checklistStatusTones } from '../constants/tripChecklists.constants'
import type { ChecklistStatus } from '../types/tripChecklists.types'

interface ChecklistStatusBadgeProps {
  status: ChecklistStatus
}

export function ChecklistStatusBadge({ status }: ChecklistStatusBadgeProps) {
  return <Badge tone={checklistStatusTones[status]}>{checklistStatusLabels[status]}</Badge>
}
