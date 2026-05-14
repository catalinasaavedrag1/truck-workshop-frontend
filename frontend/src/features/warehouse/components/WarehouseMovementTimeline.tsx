import { formatDate } from '../../../shared/utils/formatDate'
import type { WarehouseMovement } from '../types/warehouse.types'
import styles from './InventoryModule.module.css'

interface WarehouseMovementTimelineProps {
  movements: WarehouseMovement[]
}

export function WarehouseMovementTimeline({ movements }: WarehouseMovementTimelineProps) {
  return (
    <div className={styles.movementTimeline}>
      {movements.map((movement) => (
        <div className={styles.movementItem} key={movement.id}>
          <span className={[styles.movementDelta, movement.quantity > 0 ? styles.inbound : styles.outbound].join(' ')}>
            {movement.quantity > 0 ? '+' : '-'}
          </span>
          <div className={styles.movementCopy}>
            <strong>{movement.partName}</strong>
            <p>
              {movement.type} de {Math.abs(movement.quantity)} en {movement.locationCode} - {formatDate(movement.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
