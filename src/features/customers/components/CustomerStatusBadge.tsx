import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { CUSTOMER_STATUS_LABELS } from '../constants/customer.constants'
import type { CustomerStatus } from '../types/customer.types'

const statusTones: Record<CustomerStatus, BadgeTone> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
}

interface CustomerStatusBadgeProps {
  status: CustomerStatus
}

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{CUSTOMER_STATUS_LABELS[status]}</Badge>
}
