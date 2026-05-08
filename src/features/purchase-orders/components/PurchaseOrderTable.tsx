import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { PurchaseOrder } from '../types/purchaseOrder.types'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[]
}

export function PurchaseOrderTable({ purchaseOrders }: PurchaseOrderTableProps) {
  const columns: TableColumn<PurchaseOrder>[] = [
    { header: 'OC', key: 'purchaseOrderNumber', render: (item) => <strong>{item.purchaseOrderNumber}</strong> },
    { header: 'Proveedor', key: 'supplierName', render: (item) => item.supplierName },
    { header: 'Estado', key: 'status', render: (item) => <PurchaseOrderStatusBadge status={item.status} /> },
    { header: 'Caso relacionado', key: 'relatedCaseId', render: (item) => item.relatedCaseId || 'Sin caso' },
    { header: 'Solicitado por', key: 'requestedBy', render: (item) => item.requestedBy || item.createdBy || 'Sistema' },
    { header: 'Entrega esperada', key: 'expectedDeliveryDate', render: (item) => formatDate(item.expectedDeliveryDate) },
    { align: 'right', header: 'Total', key: 'totalEstimated', render: (item) => formatCurrency(item.totalEstimated) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.purchaseOrderDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={purchaseOrders}
      enableSearch
      getRowHref={(item) => ROUTES.purchaseOrderDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir orden de compra ${item.purchaseOrderNumber}`}
      searchPlaceholder="Buscar OC, proveedor, estado o caso"
    />
  )
}
