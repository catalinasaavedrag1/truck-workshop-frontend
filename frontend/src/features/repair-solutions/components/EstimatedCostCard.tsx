import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

interface EstimatedCostCardProps {
  partsCost: number
  laborCost: number
}

export function EstimatedCostCard({ partsCost, laborCost }: EstimatedCostCardProps) {
  const total = partsCost + laborCost

  return (
    <Card>
      <dl className="detail-list">
        <div>
          <dt>Repuestos</dt>
          <dd>{formatCurrency(partsCost)}</dd>
        </div>
        <div>
          <dt>Mano de obra</dt>
          <dd>{formatCurrency(laborCost)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>
    </Card>
  )
}
