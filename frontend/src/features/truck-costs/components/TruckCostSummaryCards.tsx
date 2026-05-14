import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { TruckCostSummary } from '../types/truckCosts.types'

interface TruckCostSummaryCardsProps {
  summaries: TruckCostSummary[]
}

export function TruckCostSummaryCards({ summaries }: TruckCostSummaryCardsProps) {
  const total = summaries.reduce((sum, summary) => sum + summary.monthlyCost, 0)
  const averageCostPerKm =
    summaries.reduce((sum, summary) => sum + summary.costPerKm, 0) / Math.max(summaries.length, 1)
  const mostExpensive = [...summaries].sort((a, b) => b.monthlyCost - a.monthlyCost)[0]

  return (
    <div className="metric-grid">
      <Card>
        <span className="muted-text">Costo mensual</span>
        <strong className="metric-value">{formatCurrency(total)}</strong>
        <small>Flota medida</small>
      </Card>
      <Card>
        <span className="muted-text">Costo/km promedio</span>
        <strong className="metric-value">{formatCurrency(averageCostPerKm)}</strong>
        <small>Incluye fuel, taller y permisos</small>
      </Card>
      <Card>
        <span className="muted-text">Camion mas caro</span>
        <strong className="metric-value">{mostExpensive?.truckId || '-'}</strong>
        <small>{mostExpensive ? formatCurrency(mostExpensive.monthlyCost) : 'Sin datos'}</small>
      </Card>
    </div>
  )
}
