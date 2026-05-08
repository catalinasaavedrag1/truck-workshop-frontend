import { formatDate } from '../../../shared/utils/formatDate'
import type { WarehouseMovement } from '../types/warehouse.types'

interface WarehouseMovementTimelineProps {
  movements: WarehouseMovement[]
}

export function WarehouseMovementTimeline({ movements }: WarehouseMovementTimelineProps) {
  return (
    <div className="timeline">
      {movements.map((movement) => (
        <div className="timeline-step" key={movement.id}>
          <span className="timeline-dot">{movement.quantity > 0 ? '+' : '-'}</span>
          <div>
            <strong>{movement.partName}</strong>
            <p className="muted-text">
              {movement.type} de {Math.abs(movement.quantity)} en {movement.locationCode} - {formatDate(movement.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
