import { Badge } from '../../../shared/components/Badge/Badge'
import { driverTripSheetStatusLabels, driverTripSheetStatusTones } from '../constants/driverTripSheetStatus.constants'
import type { DriverTripSheetStatus } from '../types/driverTripSheet.types'

export function DriverTripSheetStatusBadge({ status }: { status: DriverTripSheetStatus }) {
  return <Badge tone={driverTripSheetStatusTones[status]}>{driverTripSheetStatusLabels[status]}</Badge>
}
