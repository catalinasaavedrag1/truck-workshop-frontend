import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
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
  const getOverdueDays = (expectedDeliveryDate: string) => {
    const elapsed = Date.now() - new Date(expectedDeliveryDate).getTime()

    return elapsed > 0 ? Math.ceil(elapsed / 86_400_000) : 0
  }

  const columns: TableColumn<PurchaseOrder>[] = [
    {
      header: 'OC / proveedor',
      key: 'purchaseOrderNumber',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.id} type="purchaseOrder">
            {item.purchaseOrderNumber}
          </EntityLink>
          <span className="muted-text">{item.supplierName}</span>
        </div>
      ),
    },
    { header: 'Estado', key: 'status', render: (item) => <PurchaseOrderStatusBadge status={item.status} /> },
    {
      header: 'Caso relacionado',
      key: 'relatedCaseId',
      render: (item) =>
        item.relatedCaseId ? (
          <EntityLink id={item.relatedCaseId} type="case">
            {item.relatedCaseId}
          </EntityLink>
        ) : (
          'Sin caso'
        ),
    },
    {
      header: 'Responsable',
      key: 'requestedBy',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.requestedBy || item.createdBy || 'Sistema'}</strong>
          <span className="muted-text">{item.approvedBy ? `Aprobada por ${item.approvedBy}` : 'Pendiente de aprobacion'}</span>
        </div>
      ),
    },
    {
      header: 'Entrega esperada',
      key: 'expectedDeliveryDate',
      render: (item) => {
        const overdueDays = getOverdueDays(item.expectedDeliveryDate)

        return (
          <div className="stack-tight">
            <span>{formatDate(item.expectedDeliveryDate)}</span>
            <span className="muted-text">{overdueDays > 0 ? `${overdueDays} dias de atraso` : 'Dentro de plazo'}</span>
          </div>
        )
      },
    },
    {
      align: 'right',
      header: 'Items',
      key: 'items',
      render: (item) => item.items.reduce((total, orderItem) => total + orderItem.quantity, 0),
      sortValue: (item) => item.items.reduce((total, orderItem) => total + orderItem.quantity, 0),
    },
    { align: 'right', header: 'Total', key: 'totalEstimated', render: (item) => formatCurrency(item.totalEstimated) },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => {
        const isReceivable = ['ORDERED', 'PARTIALLY_RECEIVED', 'OVERDUE', 'WITH_DIFFERENCE'].includes(item.status)
        const actionLabel =
          item.status === 'CANCELLED' || item.status === 'ANNULLED'
            ? 'Trazabilidad'
            : isReceivable
              ? 'Registrar recepcion'
              : 'Seguir OC'

        return (
          <div className="inline-actions">
            <Link to={ROUTES.purchaseOrderDetail(item.id)}>
              <Button size="sm" variant="secondary">
                Trazabilidad
              </Button>
            </Link>
            <Button size="sm" type="button" variant={item.status === 'OVERDUE' ? 'danger' : 'secondary'}>
              {actionLabel}
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      data={purchaseOrders}
      density="compact"
      enableSearch
      emptyDescription="No hay ordenes de compra que coincidan con la busqueda."
      getRowHref={(item) => ROUTES.purchaseOrderDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir orden de compra ${item.purchaseOrderNumber}`}
      searchPlaceholder="Buscar OC, proveedor, estado o caso"
    />
  )
}
