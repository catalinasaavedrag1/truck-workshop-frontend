import { ROUTES } from '../../../config/routes'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { PurchaseOrderItem } from '../types/purchaseOrder.types'

interface PurchaseOrderItemsTableProps {
  items: PurchaseOrderItem[]
}

export function PurchaseOrderItemsTable({ items }: PurchaseOrderItemsTableProps) {
  const columns: TableColumn<PurchaseOrderItem>[] = [
    {
      header: 'Item',
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
    { align: 'right', header: 'Cantidad', key: 'quantity', render: (item) => item.quantity },
    {
      align: 'right',
      header: 'Costo unitario',
      key: 'estimatedUnitCost',
      render: (item) => formatCurrency(item.estimatedUnitCost),
    },
    {
      align: 'right',
      header: 'Subtotal',
      key: 'subtotal',
      render: (item) => formatCurrency(item.quantity * item.estimatedUnitCost),
    },
  ]

  return (
    <Table
      columns={columns}
      data={items}
      getRowHref={(item) => ROUTES.partDetail(item.partId)}
      getRowKey={(item) => item.partId}
      getRowLabel={(item) => `Abrir repuesto ${item.sku}`}
    />
  )
}
