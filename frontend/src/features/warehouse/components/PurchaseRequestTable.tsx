import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import type { PurchaseRequestDecision } from '../types/procurement.types'
import { RiskBadge, StatusBadge } from './ProcurementBadges'

interface PurchaseRequestTableProps {
  onSelectionChange?: (ids: Set<string>) => void
  rows: PurchaseRequestDecision[]
  selectedIds?: Set<string>
}

export function PurchaseRequestTable({ onSelectionChange, rows, selectedIds }: PurchaseRequestTableProps) {
  const columns: TableColumn<PurchaseRequestDecision>[] = [
    {
      header: 'Solicitud / origen',
      key: 'id',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.id.toUpperCase()}</strong>
          <span className="muted-text">{item.origin}</span>
          <span className="muted-text">{formatDate(item.createdAt)}</span>
        </div>
      ),
    },
    {
      header: 'SKU',
      key: 'sku',
      render: (item) => (
        <EntityLink id={item.sku} type="sku">
          {item.sku}
        </EntityLink>
      ),
    },
    {
      align: 'right',
      header: 'Cantidad',
      key: 'requestedQuantity',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.requestedQuantity} solicitadas</strong>
          <span className="muted-text">{item.suggestedQuantity} sugeridas</span>
        </div>
      ),
    },
    {
      header: 'Solicitante / comprador',
      key: 'responsible',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.requestedBy}</span>
          <span className="muted-text">{item.responsible}</span>
        </div>
      ),
    },
    {
      header: 'Justificacion',
      key: 'justification',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.justification}</span>
          <div className="inline-actions">
            <RiskBadge risk={item.risk} />
            <StatusBadge>{item.state}</StatusBadge>
          </div>
        </div>
      ),
    },
    {
      header: 'Casos / OC',
      key: 'cases',
      render: (item) => (
        <div className="stack-tight">
          <div className="inline-actions">
            {item.cases.map((workshopCase) => (
              <EntityLink id={workshopCase.id} key={workshopCase.id} type={workshopCase.type} variant="subtle">
                {workshopCase.label}
              </EntityLink>
            ))}
          </div>
          {item.purchaseOrderId ? (
            <EntityLink id={item.purchaseOrderId} type="purchaseOrder" variant="subtle">
              {item.purchaseOrderNumber}
            </EntityLink>
          ) : (
            <span className="muted-text">Sin OC relacionada</span>
          )}
        </div>
      ),
    },
    { header: 'SLA', key: 'sla', render: (item) => item.sla },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Button size="sm" type="button" variant="secondary">
            Ajustar cantidad
          </Button>
          <Link to={item.purchaseOrderId ? ROUTES.purchaseOrderDetail(item.purchaseOrderId) : ROUTES.purchaseOrderNew}>
            <Button size="sm" variant={item.state === 'Aprobada' ? 'primary' : 'secondary'}>
              {item.action}
            </Button>
          </Link>
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
      emptyDescription="No hay solicitudes que coincidan con la busqueda."
      getRowHref={(item) => item.purchaseOrderId ? ROUTES.purchaseOrderDetail(item.purchaseOrderId) : `${ROUTES.parts}?sku=${encodeURIComponent(item.sku)}`}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir contexto solicitud ${item.id}`}
      pageSize={8}
      searchPlaceholder="Buscar solicitud, SKU, solicitante, comprador, caso u OC"
      selection={
        selectedIds && onSelectionChange
          ? {
              getRowLabel: (item) => `Seleccionar solicitud ${item.id}`,
              onSelectionChange,
              selectedKeys: selectedIds,
            }
          : undefined
      }
    />
  )
}
