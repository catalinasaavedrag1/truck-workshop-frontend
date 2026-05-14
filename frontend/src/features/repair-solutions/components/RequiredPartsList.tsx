import { partsMock } from '../../../mocks/parts.mock'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

export function RequiredPartsList() {
  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Repuestos</h2>
        {partsMock.slice(0, 2).map((part) => (
          <div className="list-row" key={part.id}>
            <div>
              <strong>{part.name}</strong>
              <p className="muted-text">{part.sku}</p>
            </div>
            <strong>{formatCurrency(part.unitCost)}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}
