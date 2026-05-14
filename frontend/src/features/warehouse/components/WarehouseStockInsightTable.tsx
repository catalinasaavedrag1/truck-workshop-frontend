import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { WarehouseStockInsightRow } from '../services/warehouseInsights.service'
import { getStockLabel, getStockTone } from '../services/warehouseInsights.service'

interface WarehouseStockInsightTableProps {
  enableSearch?: boolean
  isLoading?: boolean
  rows: WarehouseStockInsightRow[]
  variant?: 'compact' | 'full'
}

export function WarehouseStockInsightTable({
  enableSearch = true,
  isLoading = false,
  rows,
  variant = 'full',
}: WarehouseStockInsightTableProps) {
  const columns: TableColumn<WarehouseStockInsightRow>[] = variant === 'compact'
    ? [
        {
          header: 'SKU / estado',
          key: 'sku',
          render: (item) => (
            <div className="stack-tight">
              <EntityLink id={item.partId} type="part">
                {item.sku}
              </EntityLink>
              <span className="muted-text">{item.name}</span>
              <Badge tone={getStockTone(item.status)}>{getStockLabel(item.status)}</Badge>
            </div>
          ),
        },
        {
          align: 'right',
          header: 'Stock',
          key: 'quantity',
          render: (item) => (
            <div className="stack-tight">
              <strong>{item.quantity}/{item.minStock}</strong>
              <span className="muted-text">{item.requiredQuantity} u. / {item.activeCases} casos</span>
            </div>
          ),
          sortValue: (item) => item.quantity - item.minStock,
        },
        {
          header: 'Accion',
          key: 'nextAction',
          render: (item) => (
            <div className="stack-tight">
              <strong>{item.nextAction}</strong>
              <span className="muted-text">
                {item.pendingPurchaseOrder ? `${item.pendingPurchaseOrder} - ${item.pendingPurchaseOrderStatus}` : item.locationCode}
              </span>
            </div>
          ),
        },
      ]
    : [
    {
      header: 'SKU / repuesto',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.partId} type="part">
            {item.sku}
          </EntityLink>
          <span className="muted-text">
            {item.name}
            {variant === 'full' ? ` - ${item.category}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Stock / ubicacion',
      key: 'quantity',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.quantity}/{item.minStock}</strong>
          <span className="muted-text">
            <EntityLink id={item.locationCode} type="warehouseLocation" variant="subtle">
              {item.locationCode}
            </EntityLink>
          </span>
        </div>
      ),
      sortValue: (item) => item.quantity - item.minStock,
    },
    {
      align: 'right',
      header: 'Demanda',
      key: 'requiredQuantity',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.requiredQuantity} u.</strong>
          <span className="muted-text">{item.activeCases} casos</span>
        </div>
      ),
      sortValue: (item) => item.requiredQuantity,
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <Badge tone={getStockTone(item.status)}>{getStockLabel(item.status)}</Badge>,
    },
    {
      header: 'Proxima accion',
      key: 'nextAction',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.nextAction}</strong>
          <span className="muted-text">
            {item.pendingPurchaseOrder ? `${item.pendingPurchaseOrder} - ${item.pendingPurchaseOrderStatus}` : 'Sin OC activa'}
          </span>
        </div>
      ),
    },
  ]

  if (variant === 'full') {
    columns.push({
      align: 'right',
      header: 'Valor',
      key: 'stockValue',
      render: (item) => formatCurrency(item.stockValue),
    })
  }

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch={enableSearch}
      emptyDescription="Cuando exista stock ubicado se mostrara con demanda y compras asociadas."
      getRowHref={(item) => ROUTES.partDetail(item.partId)}
      getRowKey={(item) => item.partId}
      getRowLabel={(item) => `Abrir SKU ${item.sku}`}
      isLoading={isLoading}
      searchPlaceholder="Buscar SKU, repuesto, ubicacion, OC, estado o accion"
    />
  )
}
