import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { StockStatus, WarehouseStockItem } from '../types/warehouse.types'

const STOCK_TONES: Record<StockStatus, BadgeTone> = {
  available: 'success',
  'low-stock': 'warning',
  'out-of-stock': 'danger',
}

const STOCK_LABELS: Record<StockStatus, string> = {
  available: 'Disponible',
  'low-stock': 'Bajo stock',
  'out-of-stock': 'Sin stock',
}

interface StockByLocationTableProps {
  stock: WarehouseStockItem[]
}

export function StockByLocationTable({ stock }: StockByLocationTableProps) {
  const columns: TableColumn<WarehouseStockItem>[] = [
    {
      header: 'Repuesto',
      key: 'name',
      render: (item) => (
        <div>
          <EntityLink id={item.partId} type="part">
            {item.name}
          </EntityLink>
          <p className="muted-text">{item.sku}</p>
        </div>
      ),
    },
    {
      header: 'Ubicacion',
      key: 'locationCode',
      render: (item) => (
        <EntityLink id={item.locationCode} type="warehouseLocation" variant="subtle">
          {item.locationCode}
        </EntityLink>
      ),
    },
    { align: 'right', header: 'Cantidad', key: 'quantity', render: (item) => item.quantity },
    { align: 'right', header: 'Stock minimo', key: 'minStock', render: (item) => item.minStock },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <Badge tone={STOCK_TONES[item.status]}>{STOCK_LABELS[item.status]}</Badge>,
    },
  ]

  return (
    <Table
      columns={columns}
      data={stock}
      density="compact"
      enableSearch
      emptyDescription="Cuando existan repuestos asignados a ubicaciones apareceran aqui."
      emptyLabel="Sin stock por ubicacion"
      getRowHref={(item) => ROUTES.partDetail(item.partId)}
      getRowKey={(item) => item.partId}
      getRowLabel={(item) => `Abrir SKU ${item.sku}`}
      searchPlaceholder="Buscar repuesto, SKU, ubicacion o estado"
    />
  )
}
