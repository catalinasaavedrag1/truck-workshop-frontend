import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { InventoryAction } from '../services/inventoryOperations'
import styles from './InventoryModule.module.css'

interface InventoryActionCardsProps {
  actions: InventoryAction[]
}

const actionRoutes: Record<string, string> = {
  'blocked-cases': ROUTES.warehouse,
  'low-stock': ROUTES.parts,
  'open-orders': ROUTES.purchaseOrders,
  'out-stock': ROUTES.warehouseStock,
}

export function InventoryActionCards({ actions }: InventoryActionCardsProps) {
  return (
    <div className={styles.actionRail}>
      {actions.map((action) => (
        <Link className={styles.actionItem} key={action.id} to={actionRoutes[action.id] || ROUTES.warehouse}>
          <div className={styles.actionHeader}>
            <strong>{action.label}</strong>
            <Badge tone={action.tone}>{action.targetLabel}</Badge>
          </div>
          <span>{action.helper}</span>
        </Link>
      ))}
    </div>
  )
}
