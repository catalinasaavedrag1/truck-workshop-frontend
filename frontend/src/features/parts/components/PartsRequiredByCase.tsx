import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { getWarehouseDemandRows } from '../../warehouse/services/warehouseInsights.service'

export function PartsRequiredByCase() {
  const rows = getWarehouseDemandRows()
    .filter((row) => row.purchaseRequiredParts > 0 || row.missingSkus.length > 0)
    .slice(0, 5)

  return (
    <Card>
      <div className="stack">
        <SectionHeader
          description="Casos donde un SKU puede detener diagnostico, reparacion o entrega."
          title="Demanda urgente desde taller"
        />
        {rows.map((row) => (
          <div className="list-row" key={row.id}>
            <div className="stack-tight">
              <strong>{row.caseNumber}</strong>
              <span className="muted-text">
                {row.truckPlate} - {row.missingSkus.join(', ') || 'sin faltantes'}
              </span>
            </div>
            <div className="inline-actions">
              <Badge tone={row.purchaseRequiredParts > 0 ? 'warning' : 'success'}>{row.actionLabel}</Badge>
              <Link to={ROUTES.caseDetail(row.caseId)}>
                <Button size="sm" variant="secondary">
                  Ver
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
