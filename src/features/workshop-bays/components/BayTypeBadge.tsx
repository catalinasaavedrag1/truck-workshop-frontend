import { Badge } from '../../../shared/components/Badge/Badge'
import type { WorkshopBayType } from '../types/workshopBay.types'

const TYPE_LABELS: Record<WorkshopBayType, string> = {
  diagnostic: 'Diagnostico',
  electrical: 'Electrica',
  mechanical: 'Mecanica',
  test: 'Prueba',
  wash: 'Lavado',
}

interface BayTypeBadgeProps {
  type: WorkshopBayType
}

export function BayTypeBadge({ type }: BayTypeBadgeProps) {
  return <Badge tone="neutral">{TYPE_LABELS[type]}</Badge>
}
