import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightProfitability } from '../types/freightProfitability.types'

interface FreightProfitabilityCardsProps {
  items: FreightProfitability[]
}

export function FreightProfitabilityCards({ items }: FreightProfitabilityCardsProps) {
  const best = [...items].sort((a, b) => b.marginPercentage - a.marginPercentage)[0]
  const worst = [...items].sort((a, b) => a.marginPercentage - b.marginPercentage)[0]
  const averageMargin = items.reduce((sum, item) => sum + item.marginPercentage, 0) / Math.max(items.length, 1)
  const averageCostPerKm = items.reduce((sum, item) => sum + item.costPerKm, 0) / Math.max(items.length, 1)

  return (
    <div className="metric-grid">
      <Card>
        <span className="muted-text">Flete mas rentable</span>
        <strong className="metric-value">{best?.freightId || '-'}</strong>
        <small>{best ? `${best.marginPercentage.toFixed(1)}% margen` : 'Sin datos'}</small>
      </Card>
      <Card>
        <span className="muted-text">Flete menos rentable</span>
        <strong className="metric-value">{worst?.freightId || '-'}</strong>
        <small>{worst ? `${worst.marginPercentage.toFixed(1)}% margen` : 'Sin datos'}</small>
      </Card>
      <Card>
        <span className="muted-text">Margen promedio</span>
        <strong className="metric-value">{averageMargin.toFixed(1)}%</strong>
        <small>Fletes cerrados</small>
      </Card>
      <Card>
        <span className="muted-text">Costo/km promedio</span>
        <strong className="metric-value">{formatCurrency(averageCostPerKm)}</strong>
        <small>Incluye desgaste y mantencion</small>
      </Card>
    </div>
  )
}
