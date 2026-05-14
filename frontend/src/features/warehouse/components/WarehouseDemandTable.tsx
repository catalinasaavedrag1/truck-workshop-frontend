import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { ContextLink, EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { WarehouseDemandRow } from '../services/warehouseInsights.service'

interface WarehouseDemandTableProps {
  enableSearch?: boolean
  isLoading?: boolean
  rows: WarehouseDemandRow[]
}

export function WarehouseDemandTable({ enableSearch = true, isLoading = false, rows }: WarehouseDemandTableProps) {
  const columns: TableColumn<WarehouseDemandRow>[] = [
    {
      header: 'Caso / camion',
      key: 'case',
      render: (item) => (
        <div className="stack-tight">
          <EntityLink id={item.caseId} type="case">
            {item.caseNumber}
          </EntityLink>
          <span className="muted-text">
            {item.customerName} - {item.truckPlate}
          </span>
        </div>
      ),
    },
    {
      header: 'Riesgo',
      key: 'risk',
      render: (item) => (
        <div className="inline-actions">
          <Badge tone={item.priority === 'critical' ? 'danger' : item.priority === 'high' ? 'warning' : 'info'}>
            {item.priority}
          </Badge>
          <Badge tone={item.slaStatus === 'BREACHED' ? 'danger' : item.slaStatus === 'AT_RISK' ? 'warning' : 'success'}>
            {item.slaStatus}
          </Badge>
        </div>
      ),
    },
    {
      align: 'right',
      header: 'Repuestos',
      key: 'availableParts',
      render: (item) => (
        <div className="stack-tight">
          <strong>{item.availableParts}/{item.requestedParts}</strong>
          <span className="muted-text">{item.purchaseRequiredParts + item.waitingReceptionParts} bloquean</span>
        </div>
      ),
      sortValue: (item) => item.purchaseRequiredParts + item.waitingReceptionParts,
    },
    {
      header: 'Faltantes',
      key: 'missingSkus',
      render: (item) =>
        item.missingSkus.length ? (
          <span>
            {item.missingSkus.slice(0, 3).map((sku, index) => (
              <span key={sku}>
                {index > 0 ? ', ' : null}
                <ContextLink to={`${ROUTES.parts}?sku=${encodeURIComponent(sku)}`} variant="subtle">
                  {sku}
                </ContextLink>
              </span>
            ))}
            {item.missingSkus.length > 3 ? ` +${item.missingSkus.length - 3}` : ''}
          </span>
        ) : (
          'Sin faltantes'
        ),
    },
    { header: 'Accion', key: 'actionLabel', render: (item) => <strong>{item.actionLabel}</strong> },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      density="compact"
      enableSearch={enableSearch}
      emptyDescription="No hay casos solicitando repuestos en este momento."
      getRowHref={(item) => ROUTES.caseDetail(item.caseId)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir caso ${item.caseNumber}`}
      isLoading={isLoading}
      searchPlaceholder="Buscar caso, camion, operacion, SKU, SLA o accion"
    />
  )
}
