import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightRequest } from '../types/freight.types'
import { FREIGHT_FLOW_STEPS, getFreightPriority, getFreightRequestStage } from '../utils/freightOperations'
import { FreightPriorityBadge } from './FreightPriorityBadge'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'
import styles from './FreightModule.module.css'

interface FreightRequestTableProps {
  requests: FreightRequest[]
}

export function FreightRequestTable({ requests }: FreightRequestTableProps) {
  const columns: TableColumn<FreightRequest>[] = [
    {
      header: 'Solicitud',
      key: 'requestNumber',
      render: (item) => (
        <div>
          <strong>{item.requestNumber}</strong>
          <div className={styles.requestMeta}>
            {item.customerId ? (
              <Link to={ROUTES.customerDetail(item.customerId)}>{item.customerName}</Link>
            ) : (
              <span className="muted-text">{item.customerName}</span>
            )}
            <FreightPriorityBadge request={item} />
          </div>
        </div>
      ),
    },
    {
      header: 'Etapa',
      key: 'stage',
      render: (item) => {
        const stage = FREIGHT_FLOW_STEPS.find((step) => step.key === getFreightRequestStage(item))
        const priority = getFreightPriority(item)

        return (
          <div className={styles.cargoCell}>
            <FreightRequestStatusBadge status={item.status} />
            <span className="muted-text">{stage?.label || 'Solicitud'}</span>
            {priority.level !== 'normal' ? <Badge tone={priority.tone}>{priority.reason}</Badge> : null}
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
        </div>
      ),
      searchableValue: (item) => `${item.originAddress} ${item.destinationAddress}`,
    },
    { align: 'right', header: 'KM', key: 'estimatedKm', render: (item) => item.estimatedKm.toLocaleString('es-CL') },
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
      header: 'Retiro',
      key: 'requestedPickupDate',
      render: (item) => item.requestedPickupDate ? formatDate(item.requestedPickupDate) : 'Por definir',
      sortValue: (item) => (item.requestedPickupDate ? new Date(item.requestedPickupDate) : undefined),
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link className={styles.nextAction} to={ROUTES.freightRequestDetail(item.id)}>
          Ver flujo <ArrowRight aria-hidden size={14} />
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={requests}
      density="compact"
      enablePagination
      enableSearch
      getRowHref={(item) => ROUTES.freightRequestDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir flujo de solicitud ${item.requestNumber}`}
      getSearchText={(item) =>
        `${item.requestNumber} ${item.customerName} ${item.originAddress} ${item.destinationAddress} ${item.cargoDescription} ${item.status}`
      }
      initialSort={{ direction: 'asc', key: 'requestedPickupDate' }}
      searchPlaceholder="Buscar solicitud, cliente, ruta, carga o estado"
    />
  )
}
