import { Badge } from '../../../shared/components/Badge/Badge'
import { maintenanceRiskLabels, maintenanceRiskTones } from '../constants/preventiveMaintenance.constants'
import type { MaintenanceRiskStatus } from '../types/preventiveMaintenance.types'

interface MaintenanceDueBadgeProps {
  status: MaintenanceRiskStatus
}

export function MaintenanceDueBadge({ status }: MaintenanceDueBadgeProps) {
  return <Badge tone={maintenanceRiskTones[status]}>{maintenanceRiskLabels[status]}</Badge>
}
