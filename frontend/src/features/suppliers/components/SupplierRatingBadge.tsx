import { Badge } from '../../../shared/components/Badge/Badge'

interface SupplierRatingBadgeProps {
  rating: number
}

export function SupplierRatingBadge({ rating }: SupplierRatingBadgeProps) {
  const tone = rating >= 4.5 ? 'success' : rating >= 4 ? 'info' : 'warning'

  return <Badge tone={tone}>{rating.toFixed(1)} / 5</Badge>
}
