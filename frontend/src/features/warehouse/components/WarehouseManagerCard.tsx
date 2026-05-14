import { Card } from '../../../shared/components/Card/Card'
import type { WarehouseManager } from '../types/warehouse.types'

interface WarehouseManagerCardProps {
  manager: WarehouseManager
}

export function WarehouseManagerCard({ manager }: WarehouseManagerCardProps) {
  return (
    <Card>
      <div className="stack">
        <div>
          <strong>{manager.name}</strong>
          <p className="muted-text">{manager.phone}</p>
        </div>
        <dl className="detail-list">
          <div>
            <dt>Turno</dt>
            <dd>{manager.shift}</dd>
          </div>
          <div>
            <dt>Casos activos</dt>
            <dd>{manager.activeCases}</dd>
          </div>
          <div>
            <dt>Ubicaciones</dt>
            <dd>{manager.assignedLocationIds.length}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
