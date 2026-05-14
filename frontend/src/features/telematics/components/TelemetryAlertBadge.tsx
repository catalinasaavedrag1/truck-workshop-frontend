import { Badge } from '../../../shared/components/Badge/Badge'
import { telemetryAlertLabels, telemetryAlertTones } from '../constants/telematics.constants'
import type { TelemetryAlertType } from '../types/telematics.types'

interface TelemetryAlertBadgeProps {
  alert: TelemetryAlertType
}

export function TelemetryAlertBadge({ alert }: TelemetryAlertBadgeProps) {
  return <Badge tone={telemetryAlertTones[alert]}>{telemetryAlertLabels[alert]}</Badge>
}
