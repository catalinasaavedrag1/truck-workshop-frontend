import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { BuyerPerformance } from '../types/procurement.types'
import { StatusBadge } from './ProcurementBadges'
import styles from './InventoryModule.module.css'

interface BuyerPerformanceCardProps {
  buyer: BuyerPerformance
}

export function BuyerPerformanceCard({ buyer }: BuyerPerformanceCardProps) {
  return (
    <article className={styles.buyerCard}>
      <div className={styles.actionHeader}>
        <div className={styles.rowMain}>
          <Link to={`${ROUTES.warehouseManagers}?buyer=${encodeURIComponent(buyer.buyerName)}`}>{buyer.buyerName}</Link>
          <span className="muted-text">{buyer.assignedCategories.join(', ')}</span>
        </div>
        <StatusBadge>{buyer.internalRating >= 85 ? 'Buen control' : buyer.internalRating >= 75 ? 'En observacion' : 'Riesgo alto'}</StatusBadge>
      </div>
      <div className={styles.buyerMetricGrid}>
        <span>
          <strong>{buyer.purchaseOrdersCreated}</strong>
          OC creadas
        </span>
        <span>
          <strong>{buyer.overduePurchaseOrders}</strong>
          OC vencidas
        </span>
        <span>
          <strong>{formatCurrency(buyer.totalPurchased)}</strong>
          comprado
        </span>
        <span>
          <strong>{buyer.averageAlertToPoHours} h</strong>
          alerta a OC
        </span>
      </div>
      <div className={styles.procurementTagList}>
        <StatusBadge>{`${buyer.urgentPurchases} urgentes`}</StatusBadge>
        <StatusBadge>{`${buyer.overstockPurchases} sobrestock`}</StatusBadge>
        <StatusBadge>{`${buyer.duplicatePurchases} duplicadas`}</StatusBadge>
        <StatusBadge>{`${buyer.withoutDemandPurchases} sin demanda`}</StatusBadge>
      </div>
      <p className="muted-text">
        {buyer.savingsVsHistory >= 0 ? 'Ahorro vs historico' : 'Sobrecosto vs historico'}:{' '}
        {formatCurrency(Math.abs(buyer.savingsVsHistory))}
      </p>
      <div className={styles.procurementTagList}>
        {buyer.alerts.map((alert) => (
          <StatusBadge key={alert}>{alert}</StatusBadge>
        ))}
      </div>
    </article>
  )
}
