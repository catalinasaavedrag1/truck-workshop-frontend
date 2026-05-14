import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { PurchaseOrderStatusBadge } from '../../purchase-orders/components/PurchaseOrderStatusBadge'
import type { ProcurementPurchaseOrder } from '../types/procurement.types'
import { RiskBadge, StatusBadge } from './ProcurementBadges'

interface SupplyPurchaseOrderTableProps {
  onSelectionChange?: (ids: Set<string>) => void
  rows: ProcurementPurchaseOrder[]
  selectedIds?: Set<string>
}

export function SupplyPurchaseOrderTable({ onSelectionChange, rows, selectedIds }: SupplyPurchaseOrderTableProps) {
  const columns: TableColumn<ProcurementPurchaseOrder>[] = [
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
      header: 'Estado / riesgo',
      key: 'status',
      render: (item) => (
        <div className="stack-tight">
          <PurchaseOrderStatusBadge status={item.status} />
          <RiskBadge risk={item.risk} />
        </div>
      ),
    },
    {
      header: 'Responsable / categoria',
      key: 'responsible',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.responsible}</span>
          <Link className="muted-text" to={`${ROUTES.inventoryReport}?category=${encodeURIComponent(item.category)}`}>
            {item.category}
          </Link>
        </div>
      ),
    },
    {
      header: 'Solicitudes / casos',
      key: 'requestIds',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.requestIds.length > 0 ? item.requestIds.join(', ') : 'OC sin solicitud'}</span>
          <div className="inline-actions">
            {item.cases.map((workshopCase) => (
              <EntityLink id={workshopCase.id} key={workshopCase.id} type={workshopCase.type} variant="subtle">
                {workshopCase.label}
              </EntityLink>
            ))}
          </div>
        </div>
      ),
    },
    {
      header: 'Fechas',
      key: 'promisedAt',
      render: (item) => (
        <div className="stack-tight">
          <span>Creada {formatDate(item.createdAt)}</span>
          <span className="muted-text">Prometida {formatDate(item.promisedAt)}</span>
          <span className="muted-text">{item.overdueDays > 0 ? `${item.overdueDays} dias de atraso` : 'Sin atraso'}</span>
        </div>
      ),
      sortValue: (item) => item.promisedAt,
    },
    {
      align: 'right',
      header: 'Items / total',
      key: 'total',
      render: (item) => (
        <div className="stack-tight">
          <strong>{formatCurrency(item.total)}</strong>
          <span className="muted-text">{item.itemsCount} items</span>
        </div>
      ),
    },
    {
      header: 'Recepcion / docs',
      key: 'receptionStatus',
      render: (item) => (
        <div className="stack-tight">
          <StatusBadge>{item.receptionStatus}</StatusBadge>
          <StatusBadge>{item.documentsStatus}</StatusBadge>
          {item.alerts.slice(0, 2).map((alert) => (
            <span className="muted-text" key={alert}>
              {alert}
            </span>
          ))}
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Link to={ROUTES.purchaseOrderDetail(item.purchaseOrderId)}>
            <Button size="sm" variant="secondary">
              Trazabilidad
            </Button>
          </Link>
          <Button size="sm" type="button" variant={item.status === 'OVERDUE' ? 'danger' : 'secondary'}>
            {item.status === 'PARTIALLY_RECEIVED' ? 'Recibir parcial' : item.status === 'OVERDUE' ? 'Reclamar proveedor' : 'Seguir OC'}
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
      emptyDescription="No hay ordenes de compra para los filtros seleccionados."
      getRowHref={(item) => ROUTES.purchaseOrderDetail(item.purchaseOrderId)}
      getRowKey={(item) => item.purchaseOrderId}
      getRowLabel={(item) => `Abrir trazabilidad ${item.purchaseOrderNumber}`}
      pageSize={8}
      searchPlaceholder="Buscar OC, proveedor, responsable, categoria, caso o alerta"
      selection={
        selectedIds && onSelectionChange
          ? {
              getRowLabel: (item) => `Seleccionar OC ${item.purchaseOrderNumber}`,
              onSelectionChange,
              selectedKeys: selectedIds,
            }
          : undefined
      }
    />
  )
}
