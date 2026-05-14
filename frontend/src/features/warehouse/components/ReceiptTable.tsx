import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import type { PurchaseReceipt } from '../types/procurement.types'
import { StatusBadge } from './ProcurementBadges'

interface ReceiptTableProps {
  onInspect?: (item: PurchaseReceipt) => void
  rows: PurchaseReceipt[]
}

export function ReceiptTable({ onInspect, rows }: ReceiptTableProps) {
  const columns: TableColumn<PurchaseReceipt>[] = [
    {
      header: 'OC / proveedor',
      key: 'purchaseOrderNumber',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.purchaseOrderId} type="purchaseOrder">
            {item.purchaseOrderNumber}
          </EntityLink>
          <EntityLink id={item.supplierId} type="supplier" variant="subtle">
            {item.supplierName}
          </EntityLink>
        </div>
      ),
    },
    {
      header: 'SKU / fecha',
      key: 'sku',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.sku} type="sku">
            {item.sku}
          </EntityLink>
          <span className="muted-text">Esperada {formatDate(item.expectedAt)}</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Cantidades',
      key: 'receivedQuantity',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.receivedQuantity}/{item.orderedQuantity}</strong>
          <span className="muted-text">{Math.max(0, item.orderedQuantity - item.receivedQuantity)} faltantes</span>
        </div>
      ),
      sortValue: (item) => item.receivedQuantity,
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => (
        <div className="stack-tight">
          <StatusBadge>{item.status}</StatusBadge>
          <StatusBadge>{item.documentStatus}</StatusBadge>
        </div>
      ),
    },
    {
      header: 'Destino / responsable',
      key: 'locationCode',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.locationCode} type="warehouseLocation" variant="subtle">
            {item.locationCode}
          </EntityLink>
          <span className="muted-text">{item.receiver}</span>
        </div>
      ),
    },
    { header: 'Evidencia', key: 'evidence', render: (item) => item.evidence },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Link to={ROUTES.purchaseOrderDetail(item.purchaseOrderId)}>
            <Button size="sm" variant="secondary">
              Abrir OC
            </Button>
          </Link>
          <Button onClick={() => onInspect?.(item)} size="sm" type="button" variant={item.status === 'Atrasada' ? 'danger' : 'secondary'}>
            {item.action}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay recepciones que coincidan con la busqueda."
      getRowHref={(item) => ROUTES.purchaseOrderDetail(item.purchaseOrderId)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir recepcion ${item.purchaseOrderNumber}`}
      pageSize={8}
      searchPlaceholder="Buscar recepcion, OC, SKU, proveedor, documento o ubicacion"
    />
  )
}
