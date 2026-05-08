import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { FreightProfitability } from '../types/freightProfitability.types'

interface FreightCostBreakdownProps {
  item: FreightProfitability
}

export function FreightCostBreakdown({ item }: FreightCostBreakdownProps) {
  const rows = [
    ['Combustible', item.fuelCost],
    ['Peajes', item.tollCost],
    ['Chofer', item.driverCost],
    ['Neumaticos', item.tireWearCost],
    ['Mantencion', item.maintenanceAllocatedCost],
    ['Otros', item.otherCosts],
  ] as const

  return (
    <Card>
      <h2 className="section-title">Desglose {item.freightId}</h2>
      {rows.map(([label, value]) => (
        <div className="list-row" key={label}>
          <span>{label}</span>
          <strong>{formatCurrency(value)}</strong>
        </div>
      ))}
    </Card>
  )
}
