import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { WarehouseDemandRow } from '../services/warehouseInsights.service'

interface WarehouseDemandTableProps {
  rows: WarehouseDemandRow[]
}

export function WarehouseDemandTable({ rows }: WarehouseDemandTableProps) {
  const columns: TableColumn<WarehouseDemandRow>[] = [
    {
      header: 'Caso / camion',
      key: 'case',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.caseNumber}</strong>
          <span className="muted-text">
            {item.customerName} - {item.truckPlate}
          </span>
        </div>
      ),
    },
    { header: 'Prioridad', key: 'priority', render: (item) => <Badge tone={item.priority === 'critical' ? 'danger' : item.priority === 'high' ? 'warning' : 'info'}>{item.priority}</Badge> },
    { header: 'SLA', key: 'slaStatus', render: (item) => <Badge tone={item.slaStatus === 'BREACHED' ? 'danger' : item.slaStatus === 'AT_RISK' ? 'warning' : 'success'}>{item.slaStatus}</Badge> },
    { align: 'right', header: 'Disponibles', key: 'availableParts', render: (item) => `${item.availableParts}/${item.requestedParts}` },
    { align: 'right', header: 'Compra', key: 'purchaseRequiredParts', render: (item) => <Badge tone={item.purchaseRequiredParts > 0 ? 'warning' : 'success'}>{item.purchaseRequiredParts}</Badge> },
    { header: 'Faltantes', key: 'missingSkus', render: (item) => item.missingSkus.length ? item.missingSkus.join(', ') : 'Sin faltantes' },
    { header: 'Accion', key: 'actionLabel', render: (item) => <strong>{item.actionLabel}</strong> },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.caseDetail(item.caseId)}>
          <Button size="sm" variant="secondary">
            Ver caso
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch
      emptyDescription="No hay casos solicitando repuestos en este momento."
      getRowHref={(item) => ROUTES.caseDetail(item.caseId)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir caso ${item.caseNumber}`}
      searchPlaceholder="Buscar caso, camion, operacion, SKU, SLA o accion"
    />
  )
}
