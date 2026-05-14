import { Badge } from '../../../shared/components/Badge/Badge'
import { incidentSeverityLabels, incidentSeverityTones } from '../constants/incidents.constants'
import type { IncidentSeverity } from '../types/incidents.types'

interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity
}

export function IncidentSeverityBadge({ severity }: IncidentSeverityBadgeProps) {
  return <Badge tone={incidentSeverityTones[severity]}>{incidentSeverityLabels[severity]}</Badge>
}
