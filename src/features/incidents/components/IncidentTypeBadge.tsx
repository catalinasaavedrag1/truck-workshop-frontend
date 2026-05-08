import { Badge } from '../../../shared/components/Badge/Badge'
import { incidentTypeLabels } from '../constants/incidents.constants'
import type { IncidentType } from '../types/incidents.types'

interface IncidentTypeBadgeProps {
  type: IncidentType
}

export function IncidentTypeBadge({ type }: IncidentTypeBadgeProps) {
  return <Badge tone="info">{incidentTypeLabels[type]}</Badge>
}
