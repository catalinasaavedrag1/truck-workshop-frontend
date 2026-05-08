import { AlertTriangle, Package, PackageCheck, PackageX, ShoppingCart } from 'lucide-react'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import type { PartInventoryRow } from '../../warehouse/services/warehouseInsights.service'
import { formatCurrency } from '../../../shared/utils/formatCurrency'

interface PartInventorySummaryProps {
  rows: PartInventoryRow[]
}

export function PartInventorySummary({ rows }: PartInventorySummaryProps) {
  const totalSkus = rows.length
  const lowStock = rows.filter((row) => row.status === 'low-stock').length
  const outOfStock = rows.filter((row) => row.status === 'out-of-stock').length
  const withCases = rows.filter((row) => row.activeCases > 0).length
  const withPurchaseOrders = rows.filter((row) => row.pendingPurchaseOrder).length
  const stockValue = rows.reduce((total, row) => total + row.stockValue, 0)

  return (
    <div className="metric-grid">
      <MetricCard helper="Catalogo maestro" icon={<Package aria-hidden size={18} />} label="SKUs" tone="info" value={totalSkus} />
      <MetricCard helper="Reponer pronto" icon={<AlertTriangle aria-hidden size={18} />} label="Bajo minimo" tone={lowStock ? 'warning' : 'success'} value={lowStock} />
      <MetricCard helper="No entregables" icon={<PackageX aria-hidden size={18} />} label="Sin stock" tone={outOfStock ? 'danger' : 'success'} value={outOfStock} />
      <MetricCard helper="Usados por casos" icon={<PackageCheck aria-hidden size={18} />} label="Con demanda" tone="neutral" value={withCases} />
      <MetricCard helper="Reposicion activa" icon={<ShoppingCart aria-hidden size={18} />} label="Con OC" tone={withPurchaseOrders ? 'warning' : 'success'} value={withPurchaseOrders} />
      <MetricCard helper="Stock valorizado" icon={<Package aria-hidden size={18} />} label="Valor total" tone="neutral" value={formatCurrency(stockValue)} />
    </div>
  )
}
