import { Link } from 'react-router-dom'
import {
  BarChart3,
  CreditCard,
  FileText,
  MapPinned,
  Route,
  ShieldAlert,
  Truck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { FreightRequestStatusBadge } from '../../freight/components/FreightRequestStatusBadge'
import type { Customer } from '../types/customer.types'
import { getCreditUsagePercent } from '../utils/customerPricing'
import type { Customer360Snapshot } from '../utils/customer360'
import type {
  CustomerFreightLoad,
  CustomerLogisticsIntelligence,
  CustomerMonthlyPoint,
  CustomerRouteProfitability,
  CustomerTimelineEvent,
} from '../utils/customerLogistics'
import styles from './CustomerLogisticsControlTower.module.css'

export type CustomerDetailTab =
  | 'summary'
  | 'operation'
  | 'freights'
  | 'incidents'
  | 'profitability'
  | 'billing'
  | 'map'
  | 'analytics'

const CUSTOMER_DETAIL_TABS: Array<{
  id: CustomerDetailTab
  label: string
  icon: LucideIcon
}> = [
  { icon: BarChart3, id: 'summary', label: 'Resumen' },
  { icon: Route, id: 'operation', label: 'Operacion' },
  { icon: Truck, id: 'freights', label: 'Fletes' },
  { icon: ShieldAlert, id: 'incidents', label: 'Incidencias' },
  { icon: BarChart3, id: 'profitability', label: 'Rentabilidad' },
  { icon: CreditCard, id: 'billing', label: 'Facturacion' },
  { icon: MapPinned, id: 'map', label: 'Mapa' },
  { icon: FileText, id: 'analytics', label: 'Analitica' },
]

interface CustomerLogisticsProps {
  activeTab?: CustomerDetailTab
  customer: Customer
  intelligence: CustomerLogisticsIntelligence
  snapshot: Customer360Snapshot
}

export function CustomerExecutiveHeader({ customer, intelligence, snapshot }: CustomerLogisticsProps) {
  const { executive } = intelligence
  const contactLine = [
    customer.contactName || 'Sin contacto',
    customer.phone || customer.email || 'sin contacto operativo',
    customer.preferredOrigins[0] && customer.preferredDestinations[0]
      ? `${customer.preferredOrigins[0]} -> ${customer.preferredDestinations[0]}`
      : undefined,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <section className={styles.executiveHeader}>
      <div className={styles.customerIdentity}>
        <div>
          <h2>{customer.name}</h2>
          <p>{contactLine}</p>
        </div>
        <div className={styles.badgeRail}>
          {getCustomerBadges(customer, intelligence).map((badge) => (
            <Badge key={badge.label} tone={badge.tone}>{badge.label}</Badge>
          ))}
        </div>
        <div className={styles.quickFilters}>
          <Link to={`${ROUTES.freightRequests}?customer=${encodeURIComponent(customer.name)}`}>Fletes activos</Link>
          <Link to={`${ROUTES.freightQuotes}?customer=${encodeURIComponent(customer.name)}`}>Cotizaciones</Link>
          <Link to={`${ROUTES.freightProfitability}?query=${encodeURIComponent(customer.name)}`}>Rentabilidad</Link>
          <Link to={`${ROUTES.communications}?query=${encodeURIComponent(customer.name)}`}>Comunicaciones</Link>
        </div>
      </div>
      <div className={styles.kpiGrid}>
        <ExecutiveKpi
          helper={executive.revenueTrend.label}
          label="Facturacion mensual"
          tone={executive.revenueTrend.tone}
          value={formatCurrency(executive.monthlyRevenue)}
        />
        <ExecutiveKpi
          helper={executive.marginTrend.label}
          label="Margen promedio"
          tone={executive.marginTrend.tone}
          value={`${executive.averageMarginPercent}%`}
        />
        <ExecutiveKpi
          helper={`${executive.activeFreights} activos`}
          label="Fletes este mes"
          tone={executive.activeFreights > 0 ? 'info' : 'neutral'}
          value={executive.movedFreights}
        />
        <ExecutiveKpi
          helper="Entregas a tiempo"
          label="OTIF"
          tone={executive.otifPercent >= 92 ? 'success' : executive.otifPercent >= 82 ? 'warning' : 'danger'}
          value={`${executive.otifPercent}%`}
        />
        <ExecutiveKpi
          helper={executive.incidentTrend.label}
          label="Incidencias activas"
          tone={executive.incidentCount > 0 ? executive.incidentTrend.tone : 'success'}
          value={executive.incidentCount}
        />
        <ExecutiveKpi
          helper={`${snapshot.metrics.creditUsagePercent}% credito usado`}
          label="SLA critico"
          tone={executive.criticalSla > 0 ? 'danger' : 'success'}
          value={executive.criticalSla}
        />
      </div>
    </section>
  )
}

export function CustomerDetailTabs({ activeTab, customerId }: { activeTab: CustomerDetailTab; customerId: string }) {
  return (
    <nav aria-label="Vista operacional del cliente" className={styles.tabs}>
      {CUSTOMER_DETAIL_TABS.map((tab) => {
        const Icon = tab.icon

        return (
          <Link
            className={[styles.tab, activeTab === tab.id ? styles.tabActive : ''].filter(Boolean).join(' ')}
            key={tab.id}
            to={tab.id === 'summary' ? ROUTES.customerDetail(customerId) : `${ROUTES.customerDetail(customerId)}?tab=${tab.id}`}
          >
            <Icon aria-hidden size={15} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function CustomerSummaryControlView({ customer, intelligence, snapshot }: CustomerLogisticsProps) {
  return (
    <div className={styles.summaryLayout}>
      <div className="stack">
        <CustomerAlertPanel intelligence={intelligence} />
        <CustomerFreightControlTower intelligence={intelligence} />
        <CustomerExecutiveReports intelligence={intelligence} />
      </div>
      <div className="stack">
        <CustomerOperationalMap intelligence={intelligence} />
        <CustomerOperationalTimelinePanel intelligence={intelligence} />
        <CustomerCommercialFinancePanel customer={customer} snapshot={snapshot} />
      </div>
    </div>
  )
}

export function CustomerFreightControlTower({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  return (
    <section className={styles.towerPanel}>
      <PanelHeader
        description="Kanban operacional por estado real: decision, asignacion, ruta, descarga, incidencia y cierre."
        meta={`${intelligence.freights.length} fletes`}
        title="Torre de control de fletes"
      />
      <div aria-label="Fletes del cliente por estado operacional" className={styles.kanban}>
        {intelligence.columns.map((column) => {
          const freights = intelligence.freights.filter((freight) => freight.column === column.key)

          return (
            <section className={styles.column} key={column.key}>
              <div className={styles.columnHeader}>
                <div>
                  <strong>{column.label}</strong>
                  <small>{column.description}</small>
                </div>
                <Badge tone={freights.some((freight) => freight.statusTone === 'danger') ? 'danger' : 'neutral'}>
                  {freights.length}
                </Badge>
              </div>
              <div className={styles.cards}>
                {freights.length > 0 ? (
                  freights.map((freight) => <CustomerFreightCard freight={freight} key={freight.operation.request.id} />)
                ) : (
                  <div className={styles.emptyColumn}>Sin fletes en esta etapa.</div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}

export function CustomerOperationalMap({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  return (
    <section className={styles.mapPanel}>
      <PanelHeader
        description="Vista sintetica de rutas, camiones, retrasos y zonas criticas del cliente."
        meta={`${intelligence.mapMarkers.length} puntos`}
        title="Mapa operacional"
      />
      <div className={styles.mapCanvas}>
        {intelligence.mapMarkers.length > 0 ? (
          intelligence.mapMarkers.map((marker, index) => (
            <Link
              className={styles.mapMarker}
              key={marker.id}
              style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
              to={marker.href}
            >
              <strong>
                <span className={[styles.markerDot, getToneClass(marker.tone)].filter(Boolean).join(' ')}>
                  {index + 1}
                </span>
                {marker.label}
              </strong>
              <span>{marker.route}</span>
              <span>{marker.meta}</span>
            </Link>
          ))
        ) : (
          <span className={styles.mapMarker}>
            <strong>Sin rutas activas</strong>
            <span>Las rutas apareceran cuando existan fletes del cliente.</span>
          </span>
        )}
      </div>
      <div className={styles.mapLegend}>
        <LegendItem label="Operativo" tone="info" />
        <LegendItem label="Riesgo" tone="warning" />
        <LegendItem label="Bloqueo" tone="danger" />
        <LegendItem label="Finalizado" tone="success" />
      </div>
    </section>
  )
}

export function CustomerExecutiveReports({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  return (
    <section className={styles.reportPanel}>
      <PanelHeader
        description="Facturacion, margen, rutas criticas, SLA e incidencias en lectura ejecutiva."
        meta="KPI vivo"
        title="Reporteria ejecutiva"
      />
      <div className={styles.chartGrid}>
        <MonthlyTrendChart points={intelligence.monthly} />
        <RouteProfitabilityList routes={intelligence.routes} />
      </div>
      <div className={styles.incidentList}>
        {intelligence.incidents.length > 0 ? (
          intelligence.incidents.map((incident) => (
            <div className={styles.incidentRow} key={incident.label}>
              <strong>{incident.label}</strong>
              <Badge tone={incident.tone}>{incident.count}</Badge>
            </div>
          ))
        ) : (
          <div className={styles.incidentRow}>
            <strong>Sin incidencias activas</strong>
            <Badge tone="success">OK</Badge>
          </div>
        )}
      </div>
    </section>
  )
}

export function CustomerAlertPanel({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  return (
    <section className={styles.alertPanel}>
      <PanelHeader
        description="Alertas accionables: que paso, impacto, responsable implicito y siguiente accion."
        meta={`${intelligence.alerts.length} alertas`}
        title="Riesgos y bloqueos"
      />
      <div className={styles.alertList}>
        {intelligence.alerts.length > 0 ? (
          intelligence.alerts.map((alert, index) => (
            <div className={styles.alertRow} key={`${alert.label}-${index}`}>
              <div className={styles.alertRowTop}>
                <div className="inline-actions">
                  <Badge tone={alert.tone}>{alert.label}</Badge>
                  <span className="muted-text">{alert.impact}</span>
                </div>
                <Link to={alert.href}>
                  <Button size="sm" variant={alert.tone === 'danger' ? 'danger' : 'secondary'}>
                    {alert.actionLabel}
                  </Button>
                </Link>
              </div>
              <p>{alert.message}</p>
            </div>
          ))
        ) : (
          <div className={styles.alertRow}>
            <div className={styles.alertRowTop}>
              <strong>Operacion sin bloqueos</strong>
              <Badge tone="success">OK</Badge>
            </div>
            <p>No hay riesgos comerciales, logisticos o de SLA activos para este cliente.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export function CustomerOperationalTimelinePanel({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  return (
    <section className={styles.timelinePanel}>
      <PanelHeader
        description="Flujo operacional del flete mas urgente: solicitud, cotizacion, aprobacion, asignacion, carga, transito y cierre."
        meta={`${intelligence.timeline.length} eventos`}
        title="Timeline operacional"
      />
      <ol className={styles.timeline}>
        {intelligence.timeline.map((event) => (
          <TimelineEvent event={event} key={`${event.title}-${event.date}`} />
        ))}
      </ol>
    </section>
  )
}

export function CustomerCommercialFinancePanel({
  customer,
  snapshot,
}: {
  customer: Customer
  snapshot: Customer360Snapshot
}) {
  return (
    <section className={styles.commercialPanel}>
      <PanelHeader
        description="Cupo, cobranza, tarifas y condiciones separadas de la operacion viva."
        meta="Comercial"
        title="Panel comercial y financiero"
      />
      <div className={styles.commercialGrid}>
        <CommercialMetric label="Credito usado" value={`${getCreditUsagePercent(customer)}%`} />
        <CommercialMetric label="Cupo disponible" value={formatCurrency(snapshot.metrics.creditAvailable)} />
        <CommercialMetric label="Plazo pago" value={`${customer.paymentTermsDays || 0} dias`} />
        <CommercialMetric label="Pipeline" value={formatCurrency(snapshot.metrics.pipelineTotal)} />
      </div>
      <div className={styles.quickFilters}>
        <Link to={`${ROUTES.customers}?view=pricing&query=${encodeURIComponent(customer.name)}`}>Tarifas</Link>
        <Link to={`${ROUTES.customers}?view=credit&query=${encodeURIComponent(customer.name)}`}>Credito</Link>
        <Link to={`${ROUTES.freightQuotes}?customer=${encodeURIComponent(customer.name)}`}>Cotizaciones</Link>
      </div>
    </section>
  )
}

function CustomerFreightCard({ freight }: { freight: CustomerFreightLoad }) {
  const request = freight.operation.request

  return (
    <article className={[styles.freightCard, getToneClass(freight.statusTone)].filter(Boolean).join(' ')}>
      <div className={styles.freightTop}>
        <EntityLink id={request.id} type="freightRequest">
          {freight.freightNumber}
        </EntityLink>
        <FreightRequestStatusBadge status={request.status} />
      </div>
      <div className={styles.freightRoute}>
        <strong>{freight.routeLabel}</strong>
        <span>{CARGO_TYPE_LABELS[request.cargoType]} / {request.cargoDescription}</span>
      </div>
      <div className={styles.freightMeta}>
        <div>
          <small>Chofer</small>
          {request.assignedDriverId || freight.operation.assignment?.driverId ? (
            <EntityLink id={request.assignedDriverId || freight.operation.assignment?.driverId} type="driver" variant="subtle">
              {freight.driverLabel}
            </EntityLink>
          ) : (
            <span>{freight.driverLabel}</span>
          )}
        </div>
        <div>
          <small>Camion</small>
          {request.assignedTruckId || freight.operation.assignment?.truckId ? (
            <EntityLink id={request.assignedTruckId || freight.operation.assignment?.truckId} type="truck" variant="subtle">
              {freight.truckLabel}
            </EntityLink>
          ) : (
            <span>{freight.truckLabel}</span>
          )}
        </div>
      </div>
      <div className={styles.freightMeta}>
        <div>
          <small>Salida</small>
          <span>{freight.pickupLabel}</span>
        </div>
        <div>
          <small>ETA</small>
          <span>{freight.etaLabel}</span>
        </div>
      </div>
      <div className={styles.progress} aria-label={`Progreso ${freight.progressPercent}%`}>
        <span style={{ width: `${freight.progressPercent}%` }} />
      </div>
      <div className={styles.freightFooter}>
        <span>{formatCurrency(freight.value)} / margen {freight.marginPercent}%</span>
        <Badge tone={freight.statusTone}>{freight.slaLabel}</Badge>
      </div>
      <div className={styles.freightFooter}>
        <span>{freight.gpsLabel}</span>
        {freight.alerts[0] ? <Badge tone={freight.alerts[0].tone}>{freight.alerts[0].label}</Badge> : null}
      </div>
      <Link className="text-link" to={freight.href}>Abrir control del flete</Link>
    </article>
  )
}

function MonthlyTrendChart({ points }: { points: CustomerMonthlyPoint[] }) {
  const maxRevenue = Math.max(1, ...points.map((point) => point.revenue))

  return (
    <div className={styles.barChart} aria-label="Evolucion mensual de facturacion">
      {points.map((point) => {
        const height = Math.max(10, Math.round((point.revenue / maxRevenue) * 150))

        return (
          <div className={styles.barItem} key={point.label}>
            <div className={styles.bar} style={{ height }} />
            <strong>{point.label}</strong>
            <small>{point.freights} fletes</small>
            <small>{point.marginPercent}% margen</small>
          </div>
        )
      })}
    </div>
  )
}

function RouteProfitabilityList({ routes }: { routes: CustomerRouteProfitability[] }) {
  return (
    <div className={styles.routeList}>
      {routes.length > 0 ? (
        routes.slice(0, 5).map((route) => (
          <Link className={styles.routeRow} key={route.id} to={`${ROUTES.freightRequests}?query=${encodeURIComponent(route.route)}`}>
            <div className={styles.routeRowTop}>
              <strong>{route.route}</strong>
              <Badge tone={route.tone}>{route.marginPercent}%</Badge>
            </div>
            <div className={styles.routeMeta}>
              <span>{route.freightCount} flete(s)</span>
              <span>{formatCurrency(route.revenue)}</span>
              <span>{route.alerts} alerta(s)</span>
            </div>
          </Link>
        ))
      ) : (
        <div className={styles.routeRow}>
          <div className={styles.routeRowTop}>
            <strong>Sin rutas cerradas</strong>
            <Badge tone="neutral">0</Badge>
          </div>
          <small>La rentabilidad por ruta aparecera al existir fletes y cierres.</small>
        </div>
      )}
    </div>
  )
}

function TimelineEvent({ event }: { event: CustomerTimelineEvent }) {
  const content = (
    <>
      <span className={styles.timelineDot} />
      <div>
        <div className="split-row">
          <strong>{event.title}</strong>
          <Badge tone={event.tone}>{event.done ? 'Listo' : 'Pendiente'}</Badge>
        </div>
        <p>{event.description}</p>
        <small>{formatDate(event.date)} / {event.actor}</small>
      </div>
    </>
  )

  if (event.href) {
    return (
      <li className={[styles.timelineItem, event.done ? styles.done : ''].filter(Boolean).join(' ')}>
        <Link className={styles.timelineLink} to={event.href}>
          {content}
        </Link>
      </li>
    )
  }

  return <li className={[styles.timelineItem, event.done ? styles.done : ''].filter(Boolean).join(' ')}>{content}</li>
}

function ExecutiveKpi({
  helper,
  label,
  tone,
  value,
}: {
  helper: string
  label: string
  tone: BadgeTone
  value: string | number
}) {
  return (
    <div className={styles.kpi}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
      <Badge tone={tone}>{getToneLabel(tone)}</Badge>
    </div>
  )
}

function PanelHeader({ description, meta, title }: { description: string; meta: string; title: string }) {
  return (
    <div className={styles.panelHeader}>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Badge tone="info">{meta}</Badge>
    </div>
  )
}

function CommercialMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.commercialMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function LegendItem({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className={styles.legendItem}>
      <span className={[styles.legendDot, getToneClass(tone)].filter(Boolean).join(' ')} />
      {label}
    </span>
  )
}

function getCustomerBadges(customer: Customer, intelligence: CustomerLogisticsIntelligence) {
  const badges: Array<{ label: string; tone: BadgeTone }> = []

  if (intelligence.executive.monthlyRevenue > 0 || intelligence.executive.movedFreights >= 2) {
    badges.push({ label: 'Cliente estrategico', tone: 'info' })
  }

  if (intelligence.executive.movedFreights >= 2) {
    badges.push({ label: 'Alto volumen', tone: 'success' })
  }

  if (customer.riskLevel === 'high' || getCreditUsagePercent(customer) >= 85) {
    badges.push({ label: 'Riesgo credito', tone: 'warning' })
  }

  if (intelligence.executive.incidentCount > 0) {
    badges.push({ label: 'Alto reclamo', tone: 'danger' })
  }

  if (customer.freightTypes.includes('REFRIGERATED') || customer.freightTypes.includes('OVERSIZED')) {
    badges.push({ label: 'Operacion compleja', tone: 'warning' })
  }

  if (customer.status === 'suspended') {
    badges.push({ label: 'Congelado', tone: 'danger' })
  }

  if (badges.length === 0) {
    badges.push({ label: 'Prioritario', tone: 'success' })
  }

  return badges
}

function getToneLabel(tone: BadgeTone) {
  const labels: Record<BadgeTone, string> = {
    danger: 'critico',
    info: 'operativo',
    neutral: 'info',
    success: 'ok',
    warning: 'riesgo',
  }

  return labels[tone]
}

function getToneClass(tone: BadgeTone) {
  return tone === 'danger' || tone === 'warning' || tone === 'success' ? styles[tone] : ''
}
