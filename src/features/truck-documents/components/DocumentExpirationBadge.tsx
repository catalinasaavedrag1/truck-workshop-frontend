import { Badge } from '../../../shared/components/Badge/Badge'
import { documentStatusLabels, documentStatusTones } from '../constants/truckDocuments.constants'
import type { TruckDocumentStatus } from '../types/truckDocuments.types'

interface DocumentExpirationBadgeProps {
  status: TruckDocumentStatus
}

export function DocumentExpirationBadge({ status }: DocumentExpirationBadgeProps) {
  return <Badge tone={documentStatusTones[status]}>{documentStatusLabels[status]}</Badge>
}
