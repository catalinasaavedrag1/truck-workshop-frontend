import { Badge } from '../../../shared/components/Badge/Badge'
import type { Part } from '../types/part.types'

interface StockBadgeProps {
  part: Part
}

export function StockBadge({ part }: StockBadgeProps) {
  if (part.stock <= 0) {
    return <Badge tone="danger">Sin stock</Badge>
  }

  if (part.stock < part.minStock) {
    return <Badge tone="warning">Bajo stock</Badge>
  }

  return <Badge tone="success">Stock OK</Badge>
}
