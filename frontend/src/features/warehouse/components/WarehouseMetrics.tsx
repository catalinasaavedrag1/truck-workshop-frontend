import { AlertTriangle, ClipboardList, DollarSign, Package, PackageX, ShoppingCart } from 'lucide-react'
import type { WarehouseMetric } from '../services/warehouseInsights.service'
import styles from './InventoryModule.module.css'

const metricIcons = {
  blocked: <ClipboardList aria-hidden size={18} />,
  low: <AlertTriangle aria-hidden size={18} />,
  out: <PackageX aria-hidden size={18} />,
  requests: <ShoppingCart aria-hidden size={18} />,
  units: <Package aria-hidden size={18} />,
  value: <DollarSign aria-hidden size={18} />,
}

interface WarehouseMetricsProps {
  metrics: WarehouseMetric[]
}

export function WarehouseMetrics({ metrics }: WarehouseMetricsProps) {
  return (
    <div className={styles.inventoryMetricStrip}>
      {metrics.map((metric) => (
        <div className={styles.inventoryMetric} key={metric.id}>
          <span className={[styles.metricIcon, styles[metric.tone]].join(' ')}>
            {metricIcons[metric.id as keyof typeof metricIcons]}
          </span>
          <div>
            <small>{metric.label}</small>
            <strong>{metric.value}</strong>
            <span>{metric.helper}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
