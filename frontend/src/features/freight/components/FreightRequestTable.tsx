import { Link } from 'react-router-dom'
import { ArrowRight, Clock, UserRound } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'
import {
  FREIGHT_FLOW_STEPS,
  getFreightRequestOperation,
  getFreightRequestSearchText,
  getFreightRequestStage,
} from '../utils/freightOperations'
import { FreightPriorityBadge } from './FreightPriorityBadge'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'
import styles from './FreightModule.module.css'

interface FreightRequestTableProps {
  assignments?: FreightAssignment[]
  emptyDescription?: string
  emptyLabel?: string
  enableSearch?: boolean
  onSelectRequest?: (requestId: string) => void
  quotes?: FreightQuote[]
  requests: FreightRequest[]
  selectedRequestId?: string
}

export function FreightRequestTable({
  assignments = [],
  emptyDescription,
  emptyLabel,
  enableSearch = true,
  onSelectRequest,
  quotes = [],
  requests,
  selectedRequestId,
}: FreightRequestTableProps) {
  const columns: TableColumn<FreightRequest>[] = [
    {
      header: 'Solicitud / Cliente',
      key: 'requestNumber',
      render: (item) => (
        <div>
          <EntityLink id={item.id} type="freightRequest">
            {item.requestNumber}
          </EntityLink>
          <div className={styles.requestMeta}>
            {item.customerId ? (
              <EntityLink id={item.customerId} type="customer" variant="subtle">
                {item.customerName}
              </EntityLink>
            ) : (
              <span className="muted-text">{item.customerName}</span>
            )}
            <FreightPriorityBadge request={item} />
            {selectedRequestId === item.id ? <Badge tone="info">Abierta</Badge> : null}
          </div>
        </div>
      ),
    },
    {
      header: 'Etapa',
      key: 'stage',
      render: (item) => {
        const stage = FREIGHT_FLOW_STEPS.find((step) => step.key === getFreightRequestStage(item))
        const operation = getFreightRequestOperation(item, quotes, assignments)

        return (
          <div className={styles.cargoCell}>
            <FreightRequestStatusBadge status={item.status} />
            <span className="muted-text">{stage?.label || 'Solicitud'}</span>
            <Badge tone={operation.risk.tone}>{operation.risk.label}</Badge>
          </div>
        )
      },
      sortValue: (item) => getFreightRequestStage(item),
    },
    {
      header: 'Ruta',
      key: 'route',
      render: (item) => (
        <div className={styles.routeCell}>
          <span>{item.originAddress}</span>
          <small className={styles.routeArrow}>a</small>
          <span>{item.destinationAddress}</span>
          <small className="muted-text">{item.estimatedKm.toLocaleString('es-CL')} km estimados</small>
        </div>
      ),
      searchableValue: (item) => `${item.originAddress} ${item.destinationAddress}`,
    },
    {
      header: 'Carga',
      key: 'cargoType',
      render: (item) => (
        <div className={styles.cargoCell}>
          <strong>{CARGO_TYPE_LABELS[item.cargoType]}</strong>
          <span className="muted-text">
            {(item.weightKg || 0).toLocaleString('es-CL')} kg / {item.volumeM3 || 0} m3
          </span>
        </div>
      ),
      searchableValue: (item) => `${CARGO_TYPE_LABELS[item.cargoType]} ${item.cargoDescription}`,
    },
    {
      header: 'Retiro / Riesgo',
      key: 'requestedPickupDate',
      render: (item) => {
        const operation = getFreightRequestOperation(item, quotes, assignments)

        return (
          <div className={styles.cargoCell}>
            <strong>{item.requestedPickupDate ? formatDate(item.requestedPickupDate) : 'Por definir'}</strong>
            <span className="muted-text">
              <Clock aria-hidden size={14} /> {operation.risk.detail}
            </span>
          </div>
        )
      },
      sortValue: (item) => (item.requestedPickupDate ? new Date(item.requestedPickupDate) : undefined),
    },
    {
      header: 'Responsable',
      key: 'responsible',
      render: (item) => {
        const operation = getFreightRequestOperation(item, quotes, assignments)

        return (
          <div className={styles.cargoCell}>
            <strong>
              <UserRound aria-hidden size={14} /> {operation.responsible}
            </strong>
            <span className="muted-text">{operation.averageHoldHours} h detenida</span>
          </div>
        )
      },
      sortValue: (item) => getFreightRequestOperation(item, quotes, assignments).responsible,
    },
    {
      header: 'Proximo paso',
      key: 'nextStep',
      render: (item) => {
        const operation = getFreightRequestOperation(item, quotes, assignments)

        return (
          <div className={styles.nextStepCell}>
            <strong>{operation.nextStep.label}</strong>
            <span>{operation.nextStep.description}</span>
          </div>
        )
      },
      searchableValue: (item) => getFreightRequestOperation(item, quotes, assignments).nextStep.label,
    },
    {
      align: 'right',
      header: 'Accion',
      key: 'actions',
      render: (item) => {
        const operation = getFreightRequestOperation(item, quotes, assignments)
        const primaryAction = operation.quickActions[0]

        return (
          <div className={styles.inlineActionStack}>
            {primaryAction ? (
              <Link className={styles.nextAction} to={primaryAction.path}>
                {primaryAction.label} <ArrowRight aria-hidden size={14} />
              </Link>
            ) : null}
            <Link className={styles.secondaryAction} to={ROUTES.freightRequestDetail(item.id)}>
              Detalle
            </Link>
          </div>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      data={requests}
      density="compact"
      emptyDescription={emptyDescription}
      emptyLabel={emptyLabel}
      enablePagination
      enableSearch={enableSearch}
      getRowHref={onSelectRequest ? undefined : (item) => ROUTES.freightRequestDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir flujo de solicitud ${item.requestNumber}`}
      getSearchText={(item) =>
        getFreightRequestSearchText(item, quotes.find((quote) => quote.id === item.quoteId || quote.requestId === item.id), assignments.find((assignment) => assignment.requestId === item.id))
      }
      initialSort={{ direction: 'asc', key: 'requestedPickupDate' }}
      onRowClick={onSelectRequest ? (item) => onSelectRequest(item.id) : undefined}
      searchPlaceholder="Buscar solicitud, cliente, ruta, carga o estado"
    />
  )
}
