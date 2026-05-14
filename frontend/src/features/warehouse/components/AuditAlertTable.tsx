import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import type { PurchaseAuditAlert } from '../types/procurement.types'
import { RiskBadge, StatusBadge } from './ProcurementBadges'

interface AuditAlertTableProps {
  onInspect?: (item: PurchaseAuditAlert) => void
  rows: PurchaseAuditAlert[]
}

export function AuditAlertTable({ onInspect, rows }: AuditAlertTableProps) {
  const columns: TableColumn<PurchaseAuditAlert>[] = [
    {
      header: 'Alerta',
      key: 'alert',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.alert}</strong>
          <span className="muted-text">{item.reason}</span>
        </div>
      ),
    },
    {
      header: 'Severidad / estado',
      key: 'severity',
      render: (item) => (
        <div className="stack-tight">
          <RiskBadge risk={item.severity} />
          <StatusBadge>{item.status}</StatusBadge>
        </div>
      ),
    },
    {
      header: 'SKU / OC / proveedor',
      key: 'relatedEntity',
      render: (item) =>
        item.relatedEntity ? (
          <EntityLink id={item.relatedEntity.id} type={item.relatedEntity.type}>
            {item.relatedEntity.label}
          </EntityLink>
        ) : (
          'Sin referencia'
        ),
    },
    {
      header: 'Responsable',
      key: 'responsible',
      render: (item) => item.responsible,
    },
    {
      align: 'right',
      header: 'Monto',
      key: 'amount',
      render: (item) => formatCurrency(item.amount),
    },
    {
      header: 'Impacto / evidencia',
      key: 'impact',
      render: (item) => (
        <div className="stack-tight">
          <span>{item.impact}</span>
          <span className="muted-text">{item.dataUsed}</span>
          <span className="muted-text">{formatDate(item.date)}</span>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Button onClick={() => onInspect?.(item)} size="sm" type="button" variant="secondary">
            Evidencia
          </Button>
          <Button onClick={() => onInspect?.(item)} size="sm" type="button" variant={item.severity === 'critical' ? 'danger' : 'secondary'}>
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
      emptyDescription="No hay alertas de auditoria para la busqueda."
      getRowKey={(item) => item.id}
      pageSize={8}
      searchPlaceholder="Buscar alerta, SKU, OC, proveedor, responsable o motivo"
    />
  )
}
