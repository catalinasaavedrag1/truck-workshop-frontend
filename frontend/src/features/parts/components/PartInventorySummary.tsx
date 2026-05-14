import { AlertTriangle, Package, PackageCheck, PackageX, ShoppingCart } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
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
      <MetricCard helper="Catalogo maestro" icon={<Package aria-hidden size={18} />} label="SKUs" tone="info" to={ROUTES.parts} value={totalSkus} />
      <MetricCard helper="Reponer pronto" icon={<AlertTriangle aria-hidden size={18} />} label="Bajo minimo" tone={lowStock ? 'warning' : 'success'} to={`${ROUTES.parts}?status=low-stock`} value={lowStock} />
      <MetricCard helper="No entregables" icon={<PackageX aria-hidden size={18} />} label="Sin stock" tone={outOfStock ? 'danger' : 'success'} to={`${ROUTES.parts}?status=out-of-stock`} value={outOfStock} />
      <MetricCard helper="Usados por casos" icon={<PackageCheck aria-hidden size={18} />} label="Con demanda" tone="neutral" to={`${ROUTES.parts}?query=casos`} value={withCases} />
      <MetricCard helper="Reposicion activa" icon={<ShoppingCart aria-hidden size={18} />} label="Con OC" tone={withPurchaseOrders ? 'warning' : 'success'} to={`${ROUTES.parts}?query=OC`} value={withPurchaseOrders} />
      <MetricCard helper="Stock valorizado" icon={<Package aria-hidden size={18} />} label="Valor total" tone="neutral" to={ROUTES.inventoryReport} value={formatCurrency(stockValue)} />
    </div>
  )
}
