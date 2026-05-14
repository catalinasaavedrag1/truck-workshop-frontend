import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightQuote, FreightRequest } from '../types/freight.types'
import { getFreightQuotePriority } from '../utils/freightOperations'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'
import styles from './FreightModule.module.css'

interface FreightQuoteTableProps {
  quotes: FreightQuote[]
  requests: FreightRequest[]
}

export function FreightQuoteTable({ quotes, requests }: FreightQuoteTableProps) {
  const columns: TableColumn<FreightQuote>[] = [
    {
      header: 'Cotizacion',
      key: 'quoteNumber',
      render: (item) => {
        const request = requests.find((candidate) => candidate.id === item.requestId)

        return (
          <div>
            <EntityLink id={item.id} type="freightQuote">
              {item.quoteNumber}
            </EntityLink>
            <p className="muted-text">
              {request ? (
                <EntityLink id={request.id} type="freightRequest" variant="subtle">
                  {request.requestNumber}
                </EntityLink>
              ) : (
                item.requestId
              )}
            </p>
          </div>
        )
      },
    },
    {
      header: 'Cliente / carga',
      key: 'customerName',
      render: (item) => (
        <div className={styles.cargoCell}>
          {item.customerId ? (
            <EntityLink id={item.customerId} type="customer">
              {item.customerName}
            </EntityLink>
          ) : (
            <strong>{item.customerName}</strong>
          )}
          <span className="muted-text">{CARGO_TYPE_LABELS[item.cargoType]}</span>
        </div>
      ),
    },
    {
      header: 'Ruta',
      key: 'route',
      render: (item) => {
        const request = requests.find((candidate) => candidate.id === item.requestId)

        if (!request) {
          return <span className="muted-text">Sin solicitud</span>
        }

        return (
          <div className={styles.miniRouteCell}>
            <div className={styles.miniRouteLine} aria-hidden>
              <span className={styles.miniRouteDot} />
              <span />
              <span className={styles.miniRouteDot} />
            </div>
            <div className={styles.miniRouteMeta}>
              <strong>{request.originAddress}</strong>
              <span>
                {request.destinationAddress} - {request.estimatedKm.toLocaleString('es-CL')} km
              </span>
            </div>
          </div>
        )
      },
      searchableValue: (item) => {
        const request = requests.find((candidate) => candidate.id === item.requestId)
        return request ? `${request.originAddress} ${request.destinationAddress} ${request.estimatedKm}` : ''
      },
      sortValue: (item) => item.estimatedKm,
    },
    {
      align: 'right',
      header: 'Total',
      key: 'total',
      render: (item) => <strong>{formatCurrency(item.total)}</strong>,
      sortValue: (item) => item.total,
    },
    {
      header: 'Validez',
      key: 'validUntil',
      render: (item) => {
        const priority = getFreightQuotePriority(item)

        return (
          <div className={styles.requestMeta}>
            <span>{formatDate(item.validUntil)}</span>
            <Badge tone={priority.tone}>{priority.label}</Badge>
          </div>
        )
      },
      sortValue: (item) => new Date(item.validUntil),
    },
    {
      header: 'Canal',
      key: 'sentBy',
      render: (item) => item.sentBy || 'Sin envio',
    },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <FreightRequestStatusBadge status={item.status} type="quote" />,
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <div className="inline-actions">
          <Link className={styles.nextAction} to={`${ROUTES.communications}?relatedEntityType=freight-quote&relatedEntityId=${encodeURIComponent(item.id)}`}>
            Chats
          </Link>
          <Link className={styles.nextAction} to={ROUTES.freightQuoteDetail(item.id)}>
            Ver flujo <ArrowRight aria-hidden size={14} />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={quotes}
      density="compact"
      enablePagination
      enableSearch
      getRowHref={(item) => ROUTES.freightQuoteDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir flujo de cotizacion ${item.quoteNumber}`}
      getSearchText={(item) => {
        const request = requests.find((candidate) => candidate.id === item.requestId)

        return [
          item.quoteNumber,
          item.customerName,
          item.requestId,
          item.status,
          item.sentBy || '',
          request?.originAddress || '',
          request?.destinationAddress || '',
          request?.estimatedKm || '',
        ].join(' ')
      }}
      initialSort={{ direction: 'asc', key: 'validUntil' }}
      searchPlaceholder="Buscar cotizacion, cliente, solicitud, canal o estado"
    />
  )
}
