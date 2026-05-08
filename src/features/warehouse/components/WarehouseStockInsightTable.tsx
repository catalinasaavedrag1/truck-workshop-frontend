import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { WarehouseStockInsightRow } from '../services/warehouseInsights.service'
import { getStockLabel, getStockTone } from '../services/warehouseInsights.service'

interface WarehouseStockInsightTableProps {
  rows: WarehouseStockInsightRow[]
}

export function WarehouseStockInsightTable({ rows }: WarehouseStockInsightTableProps) {
  const columns: TableColumn<WarehouseStockInsightRow>[] = [
    {
      header: 'SKU / repuesto',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.sku}</strong>
          <span className="muted-text">{item.name}</span>
        </div>
      ),
    },
    { header: 'Ubicacion', key: 'locationCode', render: (item) => <strong>{item.locationCode}</strong> },
    { align: 'right', header: 'Stock', key: 'quantity', render: (item) => `${item.quantity}/${item.minStock}` },
    { align: 'right', header: 'Demanda', key: 'requiredQuantity', render: (item) => `${item.requiredQuantity} u.` },
    { align: 'right', header: 'Casos', key: 'activeCases', render: (item) => item.activeCases },
    { header: 'OC', key: 'pendingPurchaseOrder', render: (item) => item.pendingPurchaseOrder ? `${item.pendingPurchaseOrder} - ${item.pendingPurchaseOrderStatus}` : 'Sin OC activa' },
    { header: 'Estado', key: 'status', render: (item) => <Badge tone={getStockTone(item.status)}>{getStockLabel(item.status)}</Badge> },
    { header: 'Proxima accion', key: 'nextAction', render: (item) => <strong>{item.nextAction}</strong> },
    { align: 'right', header: 'Valor', key: 'stockValue', render: (item) => formatCurrency(item.stockValue) },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="Cuando exista stock ubicado se mostrara con demanda y compras asociadas."
      getRowHref={(item) => ROUTES.partDetail(item.partId)}
      getRowKey={(item) => item.partId}
      getRowLabel={(item) => `Abrir SKU ${item.sku}`}
      searchPlaceholder="Buscar SKU, repuesto, ubicacion, OC, estado o accion"
    />
  )
}
