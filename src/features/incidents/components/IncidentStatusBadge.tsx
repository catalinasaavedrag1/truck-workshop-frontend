import { Badge } from '../../../shared/components/Badge/Badge'
import { incidentStatusLabels, incidentStatusTones } from '../constants/incidents.constants'
import type { IncidentStatus } from '../types/incidents.types'

interface IncidentStatusBadgeProps {
  status: IncidentStatus
}

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  return <Badge tone={incidentStatusTones[status]}>{incidentStatusLabels[status]}</Badge>
}
