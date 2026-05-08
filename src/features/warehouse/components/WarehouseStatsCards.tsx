import { casesMock } from '../../../mocks/cases.mock'
import { Card } from '../../../shared/components/Card/Card'
import { warehouseStockMock } from '../mocks/warehouse.mock'

export function WarehouseStatsCards() {
  const lowStock = warehouseStockMock.filter((item) => item.status === 'low-stock').length
  const outOfStock = warehouseStockMock.filter((item) => item.status === 'out-of-stock').length
  const blockedCases = casesMock.filter((item) => item.requiredParts.some((part) => part.requiresPurchase)).length
  const totalUnits = warehouseStockMock.reduce((total, item) => total + item.quantity, 0)

  const metrics = [
    { label: 'Unidades en stock', value: totalUnits, trend: 'en ubicaciones registradas' },
    { label: 'Bajo stock', value: lowStock, trend: 'requieren reposicion' },
    { label: 'Sin stock', value: outOfStock, trend: 'bloqueo potencial' },
    { label: 'Casos con repuestos', value: blockedCases, trend: 'visibles para bodega' },
  ]

  return (
    <div className="three-column-grid">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <div className="stack">
            <span className="muted-text">{metric.label}</span>
            <strong className="metric-value">{metric.value}</strong>
            <span className="muted-text">{metric.trend}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
