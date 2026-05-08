import { Badge } from '../../../shared/components/Badge/Badge'
import type { DriverStatus } from '../types/driver.types'

interface DriverStatusBadgeProps {
  status: DriverStatus
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  return status === 'active' ? <Badge tone="success">Activo</Badge> : <Badge tone="neutral">Inactivo</Badge>
}
