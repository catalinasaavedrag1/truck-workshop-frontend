import { Badge } from '../../../shared/components/Badge/Badge'
import { getProfitabilityTone } from '../constants/tirePerformance.constants'

interface TireProfitabilityBadgeProps {
  result: string
}

export function TireProfitabilityBadge({ result }: TireProfitabilityBadgeProps) {
  return <Badge tone={getProfitabilityTone(result)}>{result}</Badge>
}
