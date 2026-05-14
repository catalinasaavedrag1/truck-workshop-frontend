import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  CreditCard,
  FileText,
  MapPinned,
  ReceiptText,
  Route,
  Send,
  Settings2,
  ShieldAlert,
  Truck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { EntityLink } from '../../../shared/components/EntityLink'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { formatRut } from '../../../shared/utils/rut'
import { CARGO_TYPE_LABELS } from '../../freight/constants/cargoType.constants'
import { FreightRequestStatusBadge } from '../../freight/components/FreightRequestStatusBadge'
import type { Customer } from '../types/customer.types'
import { getCreditUsagePercent } from '../utils/customerPricing'
import type { Customer360Snapshot } from '../utils/customer360'
import type {
  CustomerBillingItem,
  CustomerDocumentItem,
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
  | 'documents'
  | 'map'
  | 'analytics'
  | 'commercial'

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
  { icon: FileText, id: 'documents', label: 'Documentos' },
  { icon: MapPinned, id: 'map', label: 'Mapa' },
  { icon: FileText, id: 'analytics', label: 'Analitica' },
  { icon: Settings2, id: 'commercial', label: 'Configuracion comercial' },
]

type FreightControlView = 'calendar' | 'kanban' | 'map' | 'table' | 'timeline'
type FreightQuickFilter = 'all' | 'billing' | 'critical-sla' | 'documents' | 'incident' | 'in-route' | 'low-margin' | 'unassigned'

const freightControlViews: Array<{ id: FreightControlView; label: string }> = [
  { id: 'kanban', label: 'Kanban operacional' },
  { id: 'table', label: 'Tabla avanzada' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'map', label: 'Mapa' },
  { id: 'calendar', label: 'Calendario' },
]

const quickFilters: Array<{ id: FreightQuickFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'in-route', label: 'En ruta' },
  { id: 'unassigned', label: 'Sin asignar' },
  { id: 'incident', label: 'Con incidencia' },
  { id: 'critical-sla', label: 'SLA critico' },
  { id: 'documents', label: 'Documentos faltantes' },
  { id: 'billing', label: 'No facturados' },
  { id: 'low-margin', label: 'Margen bajo' },
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
        <div className={styles.executiveMeta}>
          <span>RUT: <strong>{formatRut(customer.rut) || 'Sin RUT'}</strong></span>
          <span>Estado: <strong>{customer.status === 'active' ? 'Activo' : customer.status === 'suspended' ? 'Bloqueado' : 'En revision'}</strong></span>
          <span>Responsable: <strong>{customer.updatedBy || customer.createdBy || 'Operaciones'}</strong></span>
          <span>Zona: <strong>{customer.preferredOrigins[0] || customer.billingAddress || 'Sin zona'}</strong></span>
        </div>
        <div className={styles.badgeRail}>
          {getCustomerBadges(customer, intelligence).map((badge) => (
            <Badge key={badge.label} tone={badge.tone}>{badge.label}</Badge>
          ))}
        </div>
        <div className={styles.executiveActions}>
          <Link to={ROUTES.freightRequestNew}>
            <Button icon={<Truck size={16} />} size="sm">Nueva solicitud de flete</Button>
          </Link>
          <Link to={`${ROUTES.freightQuotes}?customer=${encodeURIComponent(customer.name)}`}>
            <Button icon={<Send size={16} />} size="sm" variant="secondary">Crear cotizacion</Button>
          </Link>
          <Link to={`${ROUTES.customers}?view=pricing&query=${encodeURIComponent(customer.name)}`}>
            <Button icon={<FileText size={16} />} size="sm" variant="secondary">Ver contrato</Button>
          </Link>
          <Link to={`${ROUTES.customerDetail(customer.id)}?tab=billing`}>
            <Button icon={<ReceiptText size={16} />} size="sm" variant="secondary">Ver facturacion</Button>
          </Link>
          <Link to={`${ROUTES.reports}?customer=${encodeURIComponent(customer.name)}`}>
            <Button icon={<FileText size={16} />} size="sm" variant="ghost">Exportar reporte</Button>
          </Link>
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
          helper={`${executive.pendingFreights} pendientes / ${executive.delayedFreights} atrasados`}
          label="Fletes activos"
          tone={executive.delayedFreights > 0 ? 'danger' : executive.activeFreights > 0 ? 'info' : 'neutral'}
          to={`${ROUTES.customerDetail(customer.id)}?tab=freights`}
          value={executive.activeFreights}
        />
        <ExecutiveKpi
          helper={executive.revenueTrend.label}
          label="Facturacion mensual"
          tone={executive.revenueTrend.tone}
          to={`${ROUTES.customerDetail(customer.id)}?tab=billing`}
          value={formatCurrency(executive.monthlyRevenue)}
        />
        <ExecutiveKpi
          helper={executive.marginTrend.label}
          label="Margen promedio"
          tone={executive.marginTrend.tone}
          to={`${ROUTES.customerDetail(customer.id)}?tab=profitability`}
          value={`${executive.averageMarginPercent}%`}
        />
        <ExecutiveKpi
          helper={`${executive.activeFreights} activos`}
          label="Fletes este mes"
          tone={executive.activeFreights > 0 ? 'info' : 'neutral'}
          value={executive.movedFreights}
        />
        <ExecutiveKpi
          helper={`${executive.assignedFreights} con recursos`}
          label="Asignados"
          tone={executive.assignedFreights > 0 ? 'info' : 'neutral'}
          to={`${ROUTES.customerDetail(customer.id)}?tab=operation`}
          value={executive.assignedFreights}
        />
        <ExecutiveKpi
          helper={`${executive.inRouteFreights} con seguimiento`}
          label="En ruta"
          tone={executive.inRouteFreights > 0 ? 'info' : 'neutral'}
          to={`${ROUTES.customerDetail(customer.id)}?tab=map`}
          value={executive.inRouteFreights}
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
          to={`${ROUTES.customerDetail(customer.id)}?tab=incidents`}
          value={executive.incidentCount}
        />
        <ExecutiveKpi
          helper={`${executive.delayedFreights} fletes atrasados`}
          label="SLA critico"
          tone={executive.criticalSla > 0 ? 'danger' : 'success'}
          value={executive.criticalSla}
        />
        <ExecutiveKpi
          helper="Pendientes de decision"
          label="Cotizaciones pendientes"
          tone={executive.pendingQuotes > 0 ? 'warning' : 'success'}
          to={`${ROUTES.customerDetail(customer.id)}?tab=billing`}
          value={executive.pendingQuotes}
        />
        <ExecutiveKpi
          helper="Guias, POD o facturas"
          label="Docs faltantes"
          tone={executive.missingDocuments > 0 ? 'warning' : 'success'}
          to={`${ROUTES.customerDetail(customer.id)}?tab=documents`}
          value={executive.missingDocuments}
        />
        <ExecutiveKpi
          helper={`${formatCurrency(snapshot.metrics.creditAvailable)} disponible`}
          label="Credito usado"
          tone={executive.creditUsedPercent >= 90 ? 'danger' : executive.creditUsedPercent >= 70 ? 'warning' : 'success'}
          to={`${ROUTES.customerDetail(customer.id)}?tab=billing`}
          value={`${executive.creditUsedPercent}%`}
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
  const [view, setView] = useState<FreightControlView>('kanban')
  const [quickFilter, setQuickFilter] = useState<FreightQuickFilter>('all')
  const visibleFreights = useMemo(
    () => intelligence.freights.filter((freight) => matchesQuickFilter(freight, quickFilter)),
    [intelligence.freights, quickFilter],
  )

  return (
    <section className={styles.towerPanel}>
      <PanelHeader
        description="Control tower por estado real: solicitud, cotizacion, asignacion, carga, ruta, descarga, incidencia, cierre y facturacion."
        meta={`${visibleFreights.length} de ${intelligence.freights.length} fletes`}
        title="Torre de control de fletes"
      />
      <div className={styles.viewToolbar}>
        <div aria-label="Cambiar vista de control de fletes" className={styles.viewSwitch} role="tablist">
          {freightControlViews.map((item) => (
            <button
              aria-selected={view === item.id}
              className={view === item.id ? styles.viewSwitchActive : undefined}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div aria-label="Filtros rapidos de fletes" className={styles.quickFilterRail}>
          {quickFilters.map((item) => (
            <button
              className={quickFilter === item.id ? styles.quickFilterActive : undefined}
              key={item.id}
              onClick={() => setQuickFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {view === 'kanban' ? <FreightKanbanView columns={intelligence.columns} freights={visibleFreights} /> : null}
      {view === 'table' ? <CustomerFreightAdvancedTable freights={visibleFreights} /> : null}
      {view === 'timeline' ? (
        <CustomerOperationalTimelinePanel
          intelligence={{ ...intelligence, timeline: buildVisibleTimeline(visibleFreights) }}
        />
      ) : null}
      {view === 'map' ? (
        <CustomerOperationalMap
          intelligence={{
            ...intelligence,
            freights: visibleFreights,
            mapMarkers: intelligence.mapMarkers.filter((marker) =>
              visibleFreights.some((freight) => freight.operation.request.id === marker.id),
            ),
          }}
        />
      ) : null}
      {view === 'calendar' ? <CustomerFreightCalendar freights={visibleFreights} /> : null}
    </section>
  )
}

function FreightKanbanView({
  columns,
  freights,
}: {
  columns: CustomerLogisticsIntelligence['columns']
  freights: CustomerFreightLoad[]
}) {
  return (
    <div aria-label="Fletes del cliente por estado operacional" className={styles.kanban}>
      {columns.map((column) => {
        const columnFreights = freights.filter((freight) => freight.column === column.key)

        return (
          <section className={styles.column} key={column.key}>
            <div className={styles.columnHeader}>
              <div>
                <strong>{column.label}</strong>
                <small>{column.description}</small>
              </div>
              <Badge tone={columnFreights.some((freight) => freight.statusTone === 'danger') ? 'danger' : 'neutral'}>
                {columnFreights.length}
              </Badge>
            </div>
            <div className={styles.cards}>
              {columnFreights.length > 0 ? (
                columnFreights.map((freight) => <CustomerFreightCard freight={freight} key={freight.operation.request.id} />)
              ) : (
                <div className={styles.emptyColumn}>Sin fletes en esta etapa.</div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function CustomerFreightAdvancedTable({ freights }: { freights: CustomerFreightLoad[] }) {
  return (
    <Table
      columns={freightColumns}
      data={freights}
      density="compact"
      emptyDescription="No hay fletes para el filtro seleccionado."
      emptyLabel="Sin fletes operacionales"
      enableSearch
      getRowHref={(freight) => freight.href}
      getRowKey={(freight) => freight.operation.request.id}
      getRowLabel={(freight) => `Abrir control ${freight.freightNumber}`}
      pageSize={10}
      searchPlaceholder="Buscar flete, ruta, chofer, camion, SLA o documento"
    />
  )
}

function CustomerFreightCalendar({ freights }: { freights: CustomerFreightLoad[] }) {
  const grouped = useMemo(() => {
    const byDay = new Map<string, CustomerFreightLoad[]>()

    for (const freight of freights) {
      const date = freight.operation.assignment?.pickupDate ||
        freight.operation.request.requestedPickupDate ||
        freight.operation.request.createdAt
      const key = formatDate(date)
      byDay.set(key, [...(byDay.get(key) || []), freight])
    }

    return [...byDay.entries()].slice(0, 8)
  }, [freights])

  return (
    <div className={styles.calendarGrid}>
      {grouped.length > 0 ? (
        grouped.map(([label, items]) => (
          <section className={styles.calendarDay} key={label}>
            <div className={styles.calendarDayHeader}>
              <strong>{label}</strong>
              <Badge tone={items.some((item) => item.statusTone === 'danger') ? 'danger' : 'info'}>{items.length}</Badge>
            </div>
            {items.map((freight) => (
              <Link className={styles.calendarEvent} key={freight.operation.request.id} to={freight.href}>
                <strong>{freight.freightNumber}</strong>
                <span>{freight.routeLabel}</span>
                <Badge tone={freight.statusTone}>{freight.slaLabel}</Badge>
              </Link>
            ))}
          </section>
        ))
      ) : (
        <div className={styles.emptyColumn}>Sin eventos para calendarizar.</div>
      )}
    </div>
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

export function CustomerRouteProfitabilityPanel({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  return (
    <section className={styles.reportPanel}>
      <PanelHeader
        description="Rutas buenas, rutas caras y rutas que necesitan renegociacion comercial u operacional."
        meta={`${intelligence.routes.length} rutas`}
        title="Rentabilidad por ruta"
      />
      <Table
        columns={routeProfitabilityColumns}
        data={intelligence.routes}
        density="compact"
        emptyDescription="No hay rutas con informacion suficiente para evaluar rentabilidad."
        emptyLabel="Sin rutas evaluadas"
        enableSearch
        getRowHref={(route) => `${ROUTES.freightRequests}?query=${encodeURIComponent(route.route)}`}
        getRowKey={(route) => route.id}
        getRowLabel={(route) => `Abrir ruta ${route.route}`}
        pageSize={8}
        searchPlaceholder="Buscar ruta, recomendacion, margen o SLA"
      />
    </section>
  )
}

export function CustomerDocumentPanel({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  const pending = intelligence.documents.filter((document) => document.status !== 'ok').length

  return (
    <section className={styles.commercialPanel}>
      <PanelHeader
        description="Guias, POD, facturas y respaldos que pueden bloquear cierre, cobranza o facturacion."
        meta={`${pending} pendientes`}
        title="Documentos operacionales"
      />
      <div className={styles.documentSummary}>
        <CommercialMetric label="Documentos faltantes" value={String(pending)} />
        <CommercialMetric
          label="Documentos vencidos"
          value={String(intelligence.documents.filter((document) => document.status === 'vencido').length)}
        />
        <CommercialMetric
          label="Listos para cierre"
          value={String(intelligence.documents.filter((document) => document.status === 'ok').length)}
        />
      </div>
      <Table
        columns={documentColumns}
        data={intelligence.documents}
        density="compact"
        emptyDescription="No hay documentos pendientes ni respaldos asociados."
        emptyLabel="Sin documentos operacionales"
        enableSearch
        getRowHref={(document) => document.href}
        getRowKey={(document) => document.id}
        getRowLabel={(document) => `Abrir documento ${document.label}`}
        pageSize={8}
        searchPlaceholder="Buscar documento, flete o estado"
      />
    </section>
  )
}

export function CustomerBillingPanel({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  const receivable = intelligence.billing
    .filter((item) => item.status === 'pendiente' || item.status === 'vencido')
    .reduce((total, item) => total + item.amount, 0)
  const billed = intelligence.billing
    .filter((item) => item.status === 'facturado' || item.status === 'pagado')
    .reduce((total, item) => total + item.amount, 0)

  return (
    <section className={styles.commercialPanel}>
      <PanelHeader
        description="Facturado, pendiente de facturar, vencido y listo para cobranza por flete."
        meta={formatCurrency(receivable)}
        title="Facturacion y cobranza"
      />
      <div className={styles.documentSummary}>
        <CommercialMetric label="Monto por cobrar" value={formatCurrency(receivable)} />
        <CommercialMetric label="Monto facturado/pagado" value={formatCurrency(billed)} />
        <CommercialMetric
          label="Fletes no facturados"
          value={String(intelligence.billing.filter((item) => item.status === 'pendiente').length)}
        />
      </div>
      <Table
        columns={billingColumns}
        data={intelligence.billing}
        density="compact"
        emptyDescription="No hay fletes con informacion de facturacion para este cliente."
        emptyLabel="Sin facturacion"
        enableSearch
        getRowHref={(item) => item.href}
        getRowKey={(item) => item.id}
        getRowLabel={(item) => `Abrir facturacion ${item.freightNumber}`}
        pageSize={8}
        searchPlaceholder="Buscar flete, estado, monto o vencimiento"
      />
    </section>
  )
}

export function CustomerQuotationPanel({ intelligence }: { intelligence: CustomerLogisticsIntelligence }) {
  const { quotations } = intelligence

  return (
    <section className={styles.commercialPanel}>
      <PanelHeader
        description="Conversion comercial de cotizaciones a operacion real, pendientes y vencidas."
        meta={`${quotations.conversionRate}% conversion`}
        title="Cotizaciones"
      />
      <div className={styles.documentSummary}>
        <CommercialMetric label="Monto cotizado" value={formatCurrency(quotations.totalAmount)} />
        <CommercialMetric label="Enviadas" value={String(quotations.sent)} />
        <CommercialMetric label="Pendientes" value={String(quotations.pending)} />
        <CommercialMetric label="Aprobadas" value={String(quotations.approved)} />
        <CommercialMetric label="Vencidas" value={String(quotations.expired)} />
        <CommercialMetric label="Rechazadas" value={String(quotations.rejected)} />
      </div>
      <div className={styles.quickFilters}>
        <Link to={ROUTES.freightQuotes}>Cotizaciones de flete</Link>
        <Link to={ROUTES.quotes}>Cotizaciones de taller</Link>
        <Link to={ROUTES.freightRequestNew}>Crear nueva solicitud</Link>
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

const freightStatusLabels: Record<CustomerFreightLoad['column'], string> = {
  approved: 'Aprobado',
  assigned: 'Asignado',
  billed: 'Facturado',
  finished: 'Finalizado',
  incident: 'Con incidencia',
  inRoute: 'En ruta',
  loading: 'En carga',
  quoting: 'Cotizando',
  requestReceived: 'Solicitud recibida',
  unassigned: 'Sin asignar',
  unloading: 'En descarga',
}

const freightColumns: TableColumn<CustomerFreightLoad>[] = [
  {
    header: 'Flete',
    key: 'freightNumber',
    render: (freight) => (
      <div>
        <EntityLink id={freight.operation.request.id} type="freightRequest">
          {freight.freightNumber}
        </EntityLink>
        <p className="muted-text">{freight.routeLabel}</p>
      </div>
    ),
  },
  {
    header: 'Estado',
    key: 'column',
    render: (freight) => <Badge tone={freight.statusTone}>{freightStatusLabels[freight.column]}</Badge>,
    sortValue: (freight) => freight.column,
  },
  {
    header: 'Carga',
    key: 'cargo',
    render: (freight) => (
      <div>
        <span>{CARGO_TYPE_LABELS[freight.operation.request.cargoType]}</span>
        <p className="muted-text">{freight.operation.request.cargoDescription}</p>
      </div>
    ),
  },
  {
    header: 'Fecha carga',
    key: 'pickup',
    render: (freight) => freight.pickupLabel,
    sortValue: (freight) => freight.operation.assignment?.pickupDate || freight.operation.request.requestedPickupDate,
  },
  { header: 'ETA', key: 'eta', render: (freight) => freight.etaLabel },
  { header: 'SLA', key: 'sla', render: (freight) => <Badge tone={freight.statusTone}>{freight.slaLabel}</Badge> },
  {
    header: 'Chofer',
    key: 'driver',
    render: (freight) => {
      const driverId = freight.operation.request.assignedDriverId || freight.operation.assignment?.driverId

      return driverId ? (
        <EntityLink id={driverId} type="driver" variant="subtle">
          {freight.driverLabel}
        </EntityLink>
      ) : (
        freight.driverLabel
      )
    },
  },
  {
    header: 'Camion',
    key: 'truck',
    render: (freight) => {
      const truckId = freight.operation.request.assignedTruckId || freight.operation.assignment?.truckId

      return truckId ? (
        <EntityLink id={truckId} type="truck" variant="subtle">
          {freight.truckLabel}
        </EntityLink>
      ) : (
        freight.truckLabel
      )
    },
  },
  {
    align: 'right',
    header: 'KM',
    key: 'km',
    render: (freight) => `${freight.operation.request.estimatedKm.toLocaleString('es-CL')} km`,
    sortValue: (freight) => freight.operation.request.estimatedKm,
  },
  {
    align: 'right',
    header: 'Venta',
    key: 'saleValue',
    render: (freight) => formatCurrency(freight.saleValue),
    sortValue: (freight) => freight.saleValue,
  },
  {
    align: 'right',
    header: 'Costo',
    key: 'cost',
    render: (freight) => formatCurrency(freight.cost),
    sortValue: (freight) => freight.cost,
  },
  {
    align: 'right',
    header: 'Margen',
    key: 'marginPercent',
    render: (freight) => <Badge tone={freight.marginPercent < 12 ? 'warning' : 'success'}>{freight.marginPercent}%</Badge>,
    sortValue: (freight) => freight.marginPercent,
  },
  {
    header: 'Control',
    key: 'control',
    render: (freight) => (
      <div className={styles.inlineBadges}>
        <Badge tone={freight.incidentsCount > 0 ? 'warning' : 'success'}>{freight.incidentsCount} incid.</Badge>
        <Badge tone={freight.documentsPending > 0 ? 'warning' : 'success'}>{freight.documentsPending} docs</Badge>
        <Badge tone={freight.billingStatus === 'paid' || freight.billingStatus === 'billed' ? 'success' : 'warning'}>
          {getBillingStatusLabel(freight.billingStatus)}
        </Badge>
      </div>
    ),
  },
  { header: 'Actualizacion', key: 'lastUpdatedAt', render: (freight) => formatDate(freight.lastUpdatedAt) },
  {
    header: 'Accion',
    key: 'actions',
    render: (freight) => (
      <Link to={freight.href}>
        <Button size="sm" variant={freight.statusTone === 'danger' ? 'danger' : 'secondary'}>
          {getFreightActionLabel(freight)}
        </Button>
      </Link>
    ),
    sortable: false,
  },
]

const routeProfitabilityColumns: TableColumn<CustomerRouteProfitability>[] = [
  {
    header: 'Ruta',
    key: 'route',
    render: (route) => (
      <div>
        <Link className="text-link" to={`${ROUTES.freightRequests}?query=${encodeURIComponent(route.route)}`}>
          {route.route}
        </Link>
        <p className="muted-text">{route.freightCount} viajes / {route.averageKm.toLocaleString('es-CL')} km prom.</p>
      </div>
    ),
  },
  { align: 'right', header: 'Venta', key: 'revenue', render: (route) => formatCurrency(route.revenue), sortValue: (route) => route.revenue },
  { align: 'right', header: 'Costo', key: 'costTotal', render: (route) => formatCurrency(route.costTotal), sortValue: (route) => route.costTotal },
  { align: 'right', header: 'Margen $', key: 'marginAmount', render: (route) => formatCurrency(route.marginAmount), sortValue: (route) => route.marginAmount },
  {
    align: 'right',
    header: 'Margen %',
    key: 'marginPercent',
    render: (route) => <Badge tone={route.tone}>{route.marginPercent}%</Badge>,
    sortValue: (route) => route.marginPercent,
  },
  { align: 'right', header: 'Costo/km', key: 'costPerKm', render: (route) => formatCurrency(route.costPerKm), sortValue: (route) => route.costPerKm },
  { align: 'right', header: 'Venta/km', key: 'revenuePerKm', render: (route) => formatCurrency(route.revenuePerKm), sortValue: (route) => route.revenuePerKm },
  { header: 'SLA', key: 'slaPercent', render: (route) => <Badge tone={route.slaPercent < 85 ? 'warning' : 'success'}>{route.slaPercent}%</Badge> },
  { header: 'Recomendacion', key: 'recommendation', render: (route) => route.recommendation },
]

const documentColumns: TableColumn<CustomerDocumentItem>[] = [
  {
    header: 'Documento',
    key: 'label',
    render: (document) => (
      <div>
        <Link className="text-link" to={document.href}>{document.label}</Link>
        <p className="muted-text">{document.freightNumber}</p>
      </div>
    ),
  },
  { header: 'Estado', key: 'status', render: (document) => <Badge tone={document.tone}>{getDocumentStatusLabel(document.status)}</Badge> },
  { header: 'Vencimiento', key: 'dueAt', render: (document) => formatDate(document.dueAt), sortValue: (document) => document.dueAt },
  {
    header: 'Accion',
    key: 'actions',
    render: (document) => (
      <Link to={document.href}>
        <Button size="sm" variant={document.tone === 'danger' ? 'danger' : 'secondary'}>
          {document.status === 'ok' ? 'Abrir respaldo' : 'Regularizar'}
        </Button>
      </Link>
    ),
    sortable: false,
  },
]

const billingColumns: TableColumn<CustomerBillingItem>[] = [
  {
    header: 'Flete',
    key: 'freightNumber',
    render: (item) => (
      <EntityLink id={item.href.split('/').at(-1) || item.freightNumber} type="freightRequest">
        {item.freightNumber}
      </EntityLink>
    ),
  },
  { align: 'right', header: 'Monto', key: 'amount', render: (item) => formatCurrency(item.amount), sortValue: (item) => item.amount },
  { header: 'Estado', key: 'status', render: (item) => <Badge tone={item.tone}>{getBillingItemLabel(item.status)}</Badge> },
  { header: 'Vencimiento', key: 'dueAt', render: (item) => formatDate(item.dueAt), sortValue: (item) => item.dueAt },
  {
    header: 'Accion',
    key: 'actions',
    render: (item) => (
      <Link to={item.href}>
        <Button size="sm" variant={item.tone === 'danger' ? 'danger' : 'secondary'}>
          {item.status === 'pagado' ? 'Ver pago' : item.status === 'facturado' ? 'Seguir cobranza' : 'Facturar'}
        </Button>
      </Link>
    ),
    sortable: false,
  },
]

function matchesQuickFilter(freight: CustomerFreightLoad, filter: FreightQuickFilter) {
  if (filter === 'all') {
    return true
  }

  if (filter === 'in-route') {
    return freight.column === 'inRoute'
  }

  if (filter === 'unassigned') {
    return freight.column === 'unassigned' || freight.truckLabel === 'Camion pendiente' || freight.driverLabel === 'Chofer pendiente'
  }

  if (filter === 'incident') {
    return freight.column === 'incident' || freight.incidentsCount > 0
  }

  if (filter === 'critical-sla') {
    return freight.slaLabel.includes('critico') || freight.statusTone === 'danger'
  }

  if (filter === 'documents') {
    return freight.documentsPending > 0
  }

  if (filter === 'billing') {
    return freight.billingStatus !== 'billed' && freight.billingStatus !== 'paid'
  }

  return freight.marginPercent < 12
}

function buildVisibleTimeline(freights: CustomerFreightLoad[]): CustomerTimelineEvent[] {
  return freights
    .map((freight) => ({
      actor: freight.driverLabel,
      date: freight.lastUpdatedAt,
      description: `${freight.routeLabel}. ${freight.gpsLabel}. ${freight.slaLabel}.`,
      done: freight.column === 'finished' || freight.column === 'billed',
      href: freight.href,
      title: `${freight.freightNumber} / ${freightStatusLabels[freight.column]}`,
      tone: freight.statusTone,
    }))
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
}

function getBillingStatusLabel(status: CustomerFreightLoad['billingStatus']) {
  if (status === 'paid') {
    return 'Pagado'
  }

  if (status === 'billed') {
    return 'Facturado'
  }

  if (status === 'pending') {
    return 'Pendiente'
  }

  return 'No facturado'
}

function getBillingItemLabel(status: CustomerBillingItem['status']) {
  if (status === 'pagado') {
    return 'Pagado'
  }

  if (status === 'facturado') {
    return 'Facturado'
  }

  if (status === 'vencido') {
    return 'Vencido'
  }

  return 'Pendiente'
}

function getDocumentStatusLabel(status: CustomerDocumentItem['status']) {
  if (status === 'ok') {
    return 'OK'
  }

  if (status === 'vencido') {
    return 'Vencido'
  }

  if (status === 'pendiente') {
    return 'Pendiente'
  }

  return 'Faltante'
}

function getFreightActionLabel(freight: CustomerFreightLoad) {
  if (freight.column === 'unassigned') {
    return 'Asignar recursos'
  }

  if (freight.column === 'inRoute' || freight.column === 'incident') {
    return 'Controlar ETA'
  }

  if (freight.column === 'finished' && freight.billingStatus !== 'billed') {
    return 'Facturar'
  }

  return 'Abrir control'
}

function ExecutiveKpi({
  helper,
  label,
  to,
  tone,
  value,
}: {
  helper: string
  label: string
  to?: string
  tone: BadgeTone
  value: string | number
}) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
      <Badge tone={tone}>{getToneLabel(tone)}</Badge>
    </>
  )

  return to ? (
    <Link className={[styles.kpi, styles.kpiLink].join(' ')} to={to}>
      {content}
    </Link>
  ) : (
    <div className={styles.kpi}>
      {content}
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
