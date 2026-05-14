import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { SupplierSkuComparison } from '../types/procurement.types'
import { StatusBadge } from './ProcurementBadges'

interface SupplierComparisonTableProps {
  rows: SupplierSkuComparison[]
}

export function SupplierComparisonTable({ rows }: SupplierComparisonTableProps) {
  const columns: TableColumn<SupplierSkuComparison>[] = [
    {
      header: 'Proveedor / SKU',
      key: 'supplierName',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.supplierId} type="supplier">
            {item.supplierName}
          </EntityLink>
          <EntityLink id={item.sku} type="sku" variant="subtle">
            {item.sku}
          </EntityLink>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Precio',
      key: 'lastPrice',
      render: (item) => (
        <div className="stack-tight">
          <strong>{formatCurrency(item.lastPrice)}</strong>
          <span className="muted-text">Prom. {formatCurrency(item.averagePrice)}</span>
          <span className="muted-text">{item.priceVariation > 0 ? '+' : ''}{item.priceVariation}% variacion</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Lead time',
      key: 'leadTimeRealDays',
      render: (item) => `${item.leadTimeRealDays} dias`,
    },
    {
      align: 'right',
      header: 'Cumplimiento',
      key: 'compliance',
      render: (item) => `${item.compliance}%`,
    },
    {
      align: 'right',
      header: 'Rating',
      key: 'rating',
      render: (item) => item.rating.toFixed(1),
    },
    {
      header: 'Riesgos',
      key: 'claimCount',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.openPurchaseOrders} OC abiertas</span>
          <span className="muted-text">{item.claimCount} reclamos</span>
        </div>
      ),
    },
    {
      header: 'Recomendacion',
      key: 'recommendation',
      render: (item) => <StatusBadge>{item.recommendation}</StatusBadge>,
    },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: () => (
        <Button size="sm" type="button" variant="secondary">
          Elegir proveedor
        </Button>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay proveedores alternativos para comparar."
      getRowKey={(item) => `${item.sku}-${item.supplierId}`}
      pageSize={8}
      searchPlaceholder="Buscar proveedor, SKU o recomendacion"
    />
  )
}
