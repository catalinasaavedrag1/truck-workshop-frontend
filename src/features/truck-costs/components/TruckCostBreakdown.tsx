import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { truckCostTypeLabels } from '../constants/truckCosts.constants'
import type { TruckCost } from '../types/truckCosts.types'

interface TruckCostBreakdownProps {
  costs: TruckCost[]
}

export function TruckCostBreakdown({ costs }: TruckCostBreakdownProps) {
  const totals = costs.reduce<Record<string, number>>((acc, cost) => {
    acc[cost.costType] = (acc[cost.costType] || 0) + cost.amount
    return acc
  }, {})

  return (
    <Card>
      <h2 className="section-title">Desglose costos</h2>
      <div className="stack">
        {Object.entries(totals).map(([type, amount]) => (
          <div className="chart-row" key={type}>
            <span>{truckCostTypeLabels[type as keyof typeof truckCostTypeLabels]}</span>
            <div className="progress-bar">
              <span style={{ width: `${Math.min((amount / 700000) * 100, 100)}%` }} />
            </div>
            <strong>{formatCurrency(amount)}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}
