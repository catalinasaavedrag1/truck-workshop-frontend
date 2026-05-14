import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  Mail,
  MapPinned,
  Package,
  Phone,
  Route,
} from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../constants/cargoType.constants'
import type { FreightRequestOperation } from '../utils/freightOperations'
import { FreightFlowStepper } from './FreightFlowStepper'
import { FreightRequestStatusBadge } from './FreightRequestStatusBadge'
import { FreightTimeline } from './FreightTimeline'
import styles from './FreightModule.module.css'

interface FreightRequestDrawerProps {
  operation?: FreightRequestOperation
}

export function FreightRequestDrawer({ operation }: FreightRequestDrawerProps) {
  if (!operation) {
    return (
      <aside className={styles.requestDrawer}>
        <EmptyState
          description="Selecciona una solicitud de la bandeja o cambia los filtros."
          icon={<Route size={22} />}
          title="Sin solicitud seleccionada"
        />
      </aside>
    )
  }

  const { assignment, nextStep, quote, request, risk } = operation
  const primaryAction = operation.quickActions[0]

  return (
    <aside className={styles.requestDrawer} aria-label={`Detalle operativo de ${request.requestNumber}`}>
      <div className={styles.drawerHeader}>
        <div>
          <EntityLink id={request.id} type="freightRequest">
            {request.requestNumber}
          </EntityLink>
          <h2>{request.customerName}</h2>
          <p>{nextStep.description}</p>
        </div>
        <div className={styles.drawerBadges}>
          <FreightRequestStatusBadge status={request.status} />
          <Badge tone={risk.tone}>{risk.label}</Badge>
        </div>
      </div>

      <div className={styles.drawerActionBar}>
        {primaryAction ? (
          <Link to={primaryAction.path}>
            <Button size="sm">{primaryAction.label}</Button>
          </Link>
        ) : null}
        <Link to={ROUTES.freightRequestDetail(request.id)}>
          <Button size="sm" variant="secondary">
            Abrir pagina
          </Button>
        </Link>
      </div>

      <FreightFlowStepper assignment={assignment} quote={quote} request={request} showStageMeta title="Workflow del flete" />

      <section className={styles.nextStepPanel}>
        <span className={styles.panelIcon}>
          <AlertTriangle aria-hidden size={17} />
        </span>
        <div>
          <small>Proximo paso</small>
          <strong>{nextStep.label}</strong>
          <p>{nextStep.owner} debe actuar. {risk.detail}.</p>
        </div>
      </section>

      <section className={styles.drawerGrid}>
        <div className={styles.controlSummary}>
          <h3>Panel de control</h3>
          <dl className="detail-list">
            <div>
              <dt>Responsable</dt>
              <dd>{operation.responsible}</dd>
            </div>
            <div>
              <dt>SLA / riesgo</dt>
              <dd>{risk.detail}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>
                {request.customerId ? (
                  <EntityLink id={request.customerId} type="customer">
                    {request.customerName}
                  </EntityLink>
                ) : (
                  request.customerName
                )}
              </dd>
            </div>
            <div>
              <dt>Contacto</dt>
              <dd>{request.customerPhone || request.customerEmail || 'Sin contacto'}</dd>
            </div>
            <div>
              <dt>Camion</dt>
              <dd>
                {request.assignedTruckId ? (
                  <EntityLink id={request.assignedTruckId} type="truck">
                    {request.assignedTruckId}
                  </EntityLink>
                ) : (
                  'Sin asignar'
                )}
              </dd>
            </div>
            <div>
              <dt>Chofer</dt>
              <dd>
                {request.assignedDriverId ? (
                  <EntityLink id={request.assignedDriverId} type="driver">
                    {request.assignedDriverId}
                  </EntityLink>
                ) : (
                  'Sin asignar'
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.routeSummaryPanel}>
          <h3>Ruta y carga</h3>
          <div className={styles.routeMiniMap}>
            <span />
            <span />
          </div>
          <dl className="detail-list">
            <div>
              <dt>
                <MapPinned aria-hidden size={14} /> Origen
              </dt>
              <dd>{request.originAddress}</dd>
            </div>
            <div>
              <dt>
                <Route aria-hidden size={14} /> Destino
              </dt>
              <dd>{request.destinationAddress}</dd>
            </div>
            <div>
              <dt>
                <Clock aria-hidden size={14} /> Retiro
              </dt>
              <dd>{request.requestedPickupDate ? formatDate(request.requestedPickupDate) : 'Por coordinar'}</dd>
            </div>
            <div>
              <dt>
                <Package aria-hidden size={14} /> Carga
              </dt>
              <dd>
                {CARGO_TYPE_LABELS[request.cargoType]} / {request.estimatedKm.toLocaleString('es-CL')} km
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {quote ? (
        <section className={styles.quoteStrip}>
          <div>
            <small>Cotizacion</small>
            <EntityLink id={quote.id} type="freightQuote">
              {quote.quoteNumber}
            </EntityLink>
          </div>
          <strong>{formatCurrency(quote.total)}</strong>
          <FreightRequestStatusBadge status={quote.status} type="quote" />
        </section>
      ) : null}

      <FreightTimeline operation={operation} />

      <section className={styles.drawerQuickActions}>
        <h3>Acciones rapidas</h3>
        <div>
          {operation.quickActions.map((action) => (
            <Link key={`${action.label}-${action.path}`} to={action.path}>
              {action.label}
            </Link>
          ))}
          <Link to={ROUTES.communications}>
            <Phone aria-hidden size={14} /> Contactar cliente
          </Link>
          <Link to={ROUTES.incidentsNew}>
            <Mail aria-hidden size={14} /> Registrar novedad
          </Link>
        </div>
      </section>
    </aside>
  )
}
