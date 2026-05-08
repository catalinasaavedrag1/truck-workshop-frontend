import { AlertTriangle, ClipboardList, DollarSign, Package, PackageX, ShoppingCart } from 'lucide-react'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import type { WarehouseMetric } from '../services/warehouseInsights.service'

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
    <div className="metric-grid">
      {metrics.map((metric) => (
        <MetricCard
          helper={metric.helper}
          icon={metricIcons[metric.id as keyof typeof metricIcons]}
          key={metric.id}
          label={metric.label}
          tone={metric.tone}
          value={metric.value}
        />
      ))}
    </div>
  )
}
