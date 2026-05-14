import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { DriverTripSheetStatus } from '../types/driverTripSheet.types'

export const driverTripSheetStatusLabels: Record<DriverTripSheetStatus, string> = {
  APPROVED: 'Aprobada',
  DRAFT: 'Borrador',
  PAID: 'Pagada',
  REJECTED: 'Observada',
  REVIEWED: 'Revisada',
  SUBMITTED: 'En revision',
}

export const driverTripSheetStatusTones: Record<DriverTripSheetStatus, BadgeTone> = {
  APPROVED: 'success',
  DRAFT: 'neutral',
  PAID: 'success',
  REJECTED: 'danger',
  REVIEWED: 'info',
  SUBMITTED: 'warning',
}
