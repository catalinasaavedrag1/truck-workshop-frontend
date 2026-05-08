import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { TruckCostSummary } from '../types/truckCosts.types'
import { TruckProfitabilityBadge } from './TruckProfitabilityBadge'

interface CostPerKmCardProps {
  summary: TruckCostSummary
}

export function CostPerKmCard({ summary }: CostPerKmCardProps) {
  return (
    <Card>
      <div className="split-row">
        <span className="muted-text">Costo por kilometro</span>
        <TruckProfitabilityBadge status={summary.profitabilityStatus} />
      </div>
      <strong className="metric-value">{formatCurrency(summary.costPerKm)}</strong>
      <small>Promedio mensual del camion</small>
    </Card>
  )
}
