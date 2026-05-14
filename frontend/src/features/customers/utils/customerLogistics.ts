import { ROUTES } from '../../../config/routes'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightRequestOperation } from '../../freight/utils/freightOperations'
import { formatHours, getFreightRequestOperation } from '../../freight/utils/freightOperations'
import type { Customer360Alert, Customer360Snapshot } from './customer360'

export type CustomerFreightColumnKey =
  | 'requestReceived'
  | 'quoting'
  | 'approved'
  | 'unassigned'
  | 'assigned'
  | 'loading'
  | 'inRoute'
  | 'unloading'
  | 'incident'
  | 'finished'
  | 'billed'

export interface CustomerFreightColumn {
  description: string
  key: CustomerFreightColumnKey
  label: string
}

export interface CustomerOperationalAlert {
  actionLabel: string
  href: string
  impact: string
  label: string
  message: string
  tone: BadgeTone
}

export interface CustomerFreightLoad {
  alerts: CustomerOperationalAlert[]
  billingStatus: 'billed' | 'not-billed' | 'paid' | 'pending'
  column: CustomerFreightColumnKey
  cost: number
  documentsPending: number
  etaLabel: string
  freightNumber: string
  gpsLabel: string
  href: string
  incidentsCount: number
  lastUpdatedAt: string
  marginPercent: number
  operation: FreightRequestOperation
  pickupLabel: string
  progressPercent: number
  routeLabel: string
  saleValue: number
  slaLabel: string
  statusTone: BadgeTone
  truckLabel: string
  value: number
  driverLabel: string
}

export interface CustomerKpiTrend {
  direction: 'down' | 'flat' | 'up'
  label: string
  tone: BadgeTone
}

export interface CustomerExecutiveKpis {
  activeFreights: number
  averageMarginPercent: number
  assignedFreights: number
  criticalSla: number
  creditAvailable: number
  creditUsedPercent: number
  delayedFreights: number
  finishedFreights: number
  inRouteFreights: number
  incidentCount: number
  monthlyRevenue: number
  movedFreights: number
  missingDocuments: number
  otifPercent: number
  pendingFreights: number
  pendingQuotes: number
  revenueTrend: CustomerKpiTrend
  marginTrend: CustomerKpiTrend
  incidentTrend: CustomerKpiTrend
}

export interface CustomerMonthlyPoint {
  costAverage: number
  freights: number
  label: string
  marginPercent: number
  revenue: number
}

export interface CustomerRouteProfitability {
  alerts: number
  averageKm: number
  costPerKm: number
  costTotal: number
  freightCount: number
  id: string
  marginAmount: number
  marginPercent: number
  recommendation: string
  revenue: number
  revenuePerKm: number
  route: string
  slaPercent: number
  tone: BadgeTone
}

export interface CustomerIncidentBreakdown {
  count: number
  label: string
  tone: BadgeTone
}

export interface CustomerMapMarker {
  href: string
  id: string
  label: string
  left: number
  meta: string
  route: string
  status: CustomerFreightColumnKey
  tone: BadgeTone
  top: number
}

export interface CustomerTimelineEvent {
  actor: string
  date: string
  description: string
  done: boolean
  href?: string
  title: string
  tone: BadgeTone
}

export interface CustomerDocumentItem {
  dueAt: string
  freightNumber: string
  href: string
  id: string
  label: string
  status: 'faltante' | 'ok' | 'pendiente' | 'vencido'
  tone: BadgeTone
}

export interface CustomerBillingItem {
  amount: number
  dueAt: string
  freightNumber: string
  href: string
  id: string
  status: 'facturado' | 'pagado' | 'pendiente' | 'vencido'
  tone: BadgeTone
}

export interface CustomerQuotationSummary {
  approved: number
  conversionRate: number
  expired: number
  pending: number
  rejected: number
  sent: number
  totalAmount: number
}

export interface CustomerLogisticsIntelligence {
  alerts: CustomerOperationalAlert[]
  billing: CustomerBillingItem[]
  columns: CustomerFreightColumn[]
  documents: CustomerDocumentItem[]
  executive: CustomerExecutiveKpis
  freights: CustomerFreightLoad[]
  incidents: CustomerIncidentBreakdown[]
  mapMarkers: CustomerMapMarker[]
  monthly: CustomerMonthlyPoint[]
  quotations: CustomerQuotationSummary
  routes: CustomerRouteProfitability[]
  timeline: CustomerTimelineEvent[]
}

export const CUSTOMER_FREIGHT_COLUMNS: CustomerFreightColumn[] = [
  { description: 'Demanda recibida y datos base por completar.', key: 'requestReceived', label: 'Solicitud recibida' },
  { description: 'Tarifa, costos y condiciones en preparacion.', key: 'quoting', label: 'Cotizando' },
  { description: 'Cotizacion aprobada o decision comercial lista.', key: 'approved', label: 'Aprobado' },
  { description: 'Aprobado sin camion o chofer confirmado.', key: 'unassigned', label: 'Sin asignar' },
  { description: 'Recursos comprometidos para la salida.', key: 'assigned', label: 'Asignado' },
  { description: 'Retiro o carga en ventana operacional.', key: 'loading', label: 'En carga' },
  { description: 'Viaje activo con trafico y ETA.', key: 'inRoute', label: 'En ruta' },
  { description: 'Entrega, descarga o cierre de recepcion.', key: 'unloading', label: 'En descarga' },
  { description: 'Bloqueos, atrasos, SLA o GPS con problema.', key: 'incident', label: 'Con incidencia' },
  { description: 'Viaje entregado, pendiente cierre administrativo.', key: 'finished', label: 'Finalizado' },
  { description: 'Facturado o pagado por backoffice.', key: 'billed', label: 'Facturado' },
]

const columnScore: Record<CustomerFreightColumnKey, number> = {
  incident: 1100,
  inRoute: 1000,
  unloading: 900,
  loading: 800,
  unassigned: 700,
  assigned: 600,
  approved: 500,
  quoting: 400,
  requestReceived: 300,
  finished: 200,
  billed: 100,
}

const criticalColumnTones: Record<CustomerFreightColumnKey, BadgeTone> = {
  assigned: 'info',
  approved: 'warning',
  billed: 'success',
  finished: 'success',
  incident: 'danger',
  inRoute: 'info',
  loading: 'warning',
  quoting: 'warning',
  requestReceived: 'info',
  unassigned: 'warning',
  unloading: 'warning',
}

export function buildCustomerLogisticsIntelligence(snapshot: Customer360Snapshot): CustomerLogisticsIntelligence {
  const operations = snapshot.freightRequests.map((request) =>
    getFreightRequestOperation(request, snapshot.freightQuotes, snapshot.freightAssignments),
  )
  const freights = operations
    .map((operation) => buildFreightLoad(snapshot, operation))
    .sort((first, second) => columnScore[second.column] - columnScore[first.column])
  const alerts = buildOperationalAlerts(snapshot, freights)
  const monthly = buildMonthlyPoints(snapshot, freights)
  const routes = buildRouteProfitability(freights)
  const incidents = buildIncidentBreakdown(snapshot, freights)
  const executive = buildExecutiveKpis(snapshot, freights, monthly, incidents)
  const documents = buildDocumentItems(freights)
  const billing = buildBillingItems(freights)

  return {
    alerts,
    billing,
    columns: CUSTOMER_FREIGHT_COLUMNS,
    documents,
    executive,
    freights,
    incidents,
    mapMarkers: buildMapMarkers(freights),
    monthly,
    quotations: buildQuotationSummary(snapshot),
    routes,
    timeline: buildOperationalTimeline(freights),
  }
}

function buildFreightLoad(snapshot: Customer360Snapshot, operation: FreightRequestOperation): CustomerFreightLoad {
  const { assignment, quote, request } = operation
  const tripSheet = snapshot.tripSheets.find(
    (sheet) =>
      sheet.requestId === request.id ||
      sheet.quoteId === quote?.id ||
      sheet.assignmentId === assignment?.id ||
      sheet.freightId === request.id,
  )
  const profitability = snapshot.freightProfitability.find(
    (item) => item.freightId === request.id || item.freightId === request.requestNumber,
  )
  const column = getFreightColumn(operation, tripSheet)
  const value = quote?.total || tripSheet?.revenue || profitability?.revenue || 0
  const marginPercent = getMarginPercent({ quoteTotal: quote?.total, marginAmount: quote?.marginAmount, profitability, tripSheet })
  const marginAmount = Math.round(value * (marginPercent / 100))
  const cost = profitability?.totalCost || tripSheet?.totalExpenses || Math.max(0, value - marginAmount)
  const alerts = buildFreightAlerts(operation, column)
  const documentsPending = getDocumentsPending(column, operation.risk.level, quote?.status)

  return {
    alerts,
    billingStatus: getBillingStatus(column, tripSheet?.status),
    column,
    cost,
    documentsPending,
    driverLabel: assignment?.driverId || request.assignedDriverId || tripSheet?.driverName || 'Chofer pendiente',
    etaLabel: formatOptionalDate(assignment?.deliveryDate || tripSheet?.deliveredAt),
    freightNumber: request.requestNumber,
    gpsLabel: getGpsLabel(column, operation.risk.level),
    href: ROUTES.freightRequestDetail(request.id),
    marginPercent,
    operation,
    pickupLabel: formatOptionalDate(assignment?.pickupDate || request.requestedPickupDate),
    progressPercent: getProgressPercent(column),
    routeLabel: `${compactPlace(request.originAddress)} -> ${compactPlace(request.destinationAddress)}`,
    incidentsCount: alerts.filter((alert) => alert.tone === 'danger' || alert.tone === 'warning').length,
    lastUpdatedAt: request.updatedAt || assignment?.updatedAt || assignment?.createdAt || request.createdAt,
    saleValue: value,
    slaLabel: getSlaLabel(column, operation.risk.level),
    statusTone: operation.risk.level === 'critical' ? 'danger' : criticalColumnTones[column],
    truckLabel: assignment?.truckId || request.assignedTruckId || tripSheet?.truckPlate || 'Camion pendiente',
    value,
  }
}

function getFreightColumn(
  operation: FreightRequestOperation,
  tripSheet?: { status?: string },
): CustomerFreightColumnKey {
  if (['CANCELLED', 'REJECTED'].includes(operation.request.status)) {
    return 'incident'
  }

  if (operation.request.status === 'DELIVERED') {
    return tripSheet?.status === 'PAID' || tripSheet?.status === 'APPROVED' ? 'billed' : 'finished'
  }

  if (operation.risk.level === 'critical') {
    return 'incident'
  }

  if (operation.request.status === 'IN_TRANSIT' || operation.assignment?.status === 'IN_TRANSIT') {
    return 'inRoute'
  }

  if (operation.assignment?.status === 'DELIVERED') {
    return 'unloading'
  }

  if (operation.assignment && new Date(operation.assignment.pickupDate).getTime() <= Date.now()) {
    return 'loading'
  }

  if (operation.request.status === 'ASSIGNED' || operation.assignment || operation.request.assignedTruckId) {
    return 'assigned'
  }

  if (operation.request.status === 'APPROVED') {
    return 'unassigned'
  }

  if (operation.request.status === 'QUOTE_SENT') {
    return 'approved'
  }

  if (operation.request.status === 'QUOTING') {
    return 'quoting'
  }

  return 'requestReceived'
}

function buildFreightAlerts(operation: FreightRequestOperation, column: CustomerFreightColumnKey): CustomerOperationalAlert[] {
  const alerts: CustomerOperationalAlert[] = []

  if (operation.risk.level !== 'normal') {
    alerts.push({
      actionLabel: operation.nextStep.actionLabel,
      href: operation.nextStep.path,
      impact: operation.risk.detail,
      label: operation.risk.label,
      message: operation.risk.detail,
      tone: operation.risk.tone,
    })
  }

  if (operation.request.status === 'APPROVED' && !operation.assignment && !operation.request.assignedTruckId) {
    alerts.push({
      actionLabel: 'Asignar recursos',
      href: ROUTES.freightAssignments,
      impact: 'Flete aprobado sin camion ni chofer',
      label: 'Sin asignacion',
      message: 'Aprobado por cliente, pendiente programacion.',
      tone: 'warning',
    })
  }

  if (column === 'inRoute' && operation.risk.level !== 'critical') {
    alerts.push({
      actionLabel: 'Actualizar ETA',
      href: ROUTES.telematics,
      impact: 'Seguimiento activo',
      label: 'GPS operativo',
      message: 'Mantener control de ETA y ruta.',
      tone: 'info',
    })
  }

  return alerts
}

function buildOperationalAlerts(snapshot: Customer360Snapshot, freights: CustomerFreightLoad[]) {
  const customerAlerts = snapshot.alerts
    .filter((alert) => alert.tone !== 'success')
    .map((alert) => mapSnapshotAlert(alert, snapshot.customer.id))
  const freightAlerts = freights.flatMap((freight) =>
    freight.alerts.map((alert) => ({
      ...alert,
      impact: `${freight.freightNumber} / ${freight.routeLabel}`,
    })),
  )

  return [...customerAlerts, ...freightAlerts]
    .sort((first, second) => getToneScore(second.tone) - getToneScore(first.tone))
    .slice(0, 8)
}

function mapSnapshotAlert(alert: Customer360Alert, customerId: string): CustomerOperationalAlert {
  return {
    actionLabel: alert.label === 'Credito y riesgo' ? 'Revisar credito' : 'Abrir cliente',
    href: ROUTES.customerDetail(customerId),
    impact: alert.label,
    label: alert.label,
    message: alert.message,
    tone: alert.tone,
  }
}

function buildExecutiveKpis(
  snapshot: Customer360Snapshot,
  freights: CustomerFreightLoad[],
  monthly: CustomerMonthlyPoint[],
  incidents: CustomerIncidentBreakdown[],
): CustomerExecutiveKpis {
  const activeFreights = freights.filter((freight) => !['finished', 'billed'].includes(freight.column)).length
  const finishedFreights = freights.filter((freight) => freight.column === 'finished' || freight.column === 'billed').length
  const incidentCount = incidents.reduce((total, item) => total + item.count, 0)
  const monthlyRevenue = monthly.at(-1)?.revenue || snapshot.metrics.approvedRevenue || snapshot.metrics.pipelineTotal
  const averageMarginPercent = getAverage(freights.map((freight) => freight.marginPercent).filter((value) => value > 0))
  const onTimeBase = finishedFreights || Math.max(1, freights.length)
  const criticalSla = freights.filter((freight) => freight.slaLabel.includes('critico')).length +
    snapshot.workshopCases.filter((item) => item.slaStatus === 'BREACHED').length
  const delayedFreights = freights.filter((freight) => freight.operation.risk.label.includes('vencido')).length

  return {
    activeFreights,
    averageMarginPercent,
    assignedFreights: freights.filter((freight) =>
      ['assigned', 'loading', 'inRoute', 'unloading'].includes(freight.column),
    ).length,
    criticalSla,
    creditAvailable: snapshot.metrics.creditAvailable,
    creditUsedPercent: snapshot.metrics.creditUsagePercent,
    delayedFreights,
    finishedFreights,
    inRouteFreights: freights.filter((freight) => freight.column === 'inRoute').length,
    incidentCount,
    marginTrend: getMarginTrend(monthly),
    missingDocuments: freights.reduce((total, freight) => total + freight.documentsPending, 0),
    monthlyRevenue,
    movedFreights: freights.length,
    otifPercent: Math.max(0, Math.round(((onTimeBase - criticalSla) / onTimeBase) * 100)),
    pendingFreights: freights.filter((freight) =>
      ['requestReceived', 'quoting', 'approved', 'unassigned'].includes(freight.column),
    ).length,
    pendingQuotes: snapshot.freightQuotes.filter((quote) => quote.status === 'DRAFT' || quote.status === 'SENT').length +
      snapshot.workshopQuotes.filter((quote) => quote.status === 'DRAFT' || quote.status === 'SENT').length,
    revenueTrend: getRevenueTrend(monthly),
    incidentTrend: {
      direction: incidentCount > 2 ? 'up' : incidentCount > 0 ? 'flat' : 'down',
      label: incidentCount > 2 ? 'riesgo sube' : incidentCount > 0 ? 'estable' : 'sin alertas',
      tone: incidentCount > 2 ? 'warning' : incidentCount > 0 ? 'info' : 'success',
    },
  }
}

function buildMonthlyPoints(snapshot: Customer360Snapshot, freights: CustomerFreightLoad[]): CustomerMonthlyPoint[] {
  const points = getLastSixMonthLabels()
  const grouped = new Map(points.map((point) => [point.key, { ...point, cost: 0, freights: 0, margin: 0, revenue: 0 }]))

  for (const freight of freights) {
    const date = freight.operation.quote?.approvedAt ||
      freight.operation.quote?.sentAt ||
      freight.operation.request.updatedAt ||
      freight.operation.request.createdAt
    const key = getMonthKey(date)
    const current = grouped.get(key)

    if (!current) {
      continue
    }

    const marginAmount = Math.round(freight.value * (freight.marginPercent / 100))
    current.freights += 1
    current.margin += marginAmount
    current.revenue += freight.value
    current.cost += Math.max(0, freight.value - marginAmount)
  }

  for (const item of snapshot.freightProfitability) {
    const key = getMonthKey(new Date().toISOString())
    const current = grouped.get(key)

    if (!current) {
      continue
    }

    current.revenue = Math.max(current.revenue, item.revenue)
    current.margin = Math.max(current.margin, item.netMargin)
    current.cost = Math.max(current.cost, item.totalCost)
  }

  return [...grouped.values()].map((point) => ({
    costAverage: point.freights > 0 ? Math.round(point.cost / point.freights) : 0,
    freights: point.freights,
    label: point.label,
    marginPercent: point.revenue > 0 ? Math.round((point.margin / point.revenue) * 1000) / 10 : 0,
    revenue: point.revenue,
  }))
}

function buildRouteProfitability(freights: CustomerFreightLoad[]): CustomerRouteProfitability[] {
  const routeMap = new Map<string, CustomerRouteProfitability & { kmTotal: number; marginTotal: number; slaTotal: number }>()

  for (const freight of freights) {
    const current = routeMap.get(freight.routeLabel) || {
      alerts: 0,
      averageKm: 0,
      costPerKm: 0,
      costTotal: 0,
      freightCount: 0,
      id: freight.routeLabel,
      kmTotal: 0,
      marginAmount: 0,
      marginPercent: 0,
      marginTotal: 0,
      recommendation: 'Sin suficiente historia',
      revenue: 0,
      revenuePerKm: 0,
      route: freight.routeLabel,
      slaPercent: 0,
      slaTotal: 0,
      tone: 'neutral' as BadgeTone,
    }

    current.alerts += freight.alerts.filter((alert) => alert.tone === 'danger' || alert.tone === 'warning').length
    current.costTotal += freight.cost
    current.freightCount += 1
    current.kmTotal += freight.operation.request.estimatedKm
    current.marginAmount += Math.max(0, freight.saleValue - freight.cost)
    current.marginTotal += freight.marginPercent
    current.revenue += freight.value
    current.slaTotal += freight.slaLabel.includes('critico') || freight.slaLabel.includes('riesgo') ? 0 : 1
    routeMap.set(freight.routeLabel, current)
  }

  return [...routeMap.values()]
    .map((route) => {
      const marginPercent = route.freightCount ? Math.round((route.marginTotal / route.freightCount) * 10) / 10 : 0
      const averageKm = route.freightCount ? Math.round(route.kmTotal / route.freightCount) : 0
      const slaPercent = route.freightCount ? Math.round((route.slaTotal / route.freightCount) * 100) : 0
      const tone: BadgeTone = marginPercent < 12 || route.alerts > 0
        ? 'warning'
        : marginPercent >= 25
          ? 'success'
          : 'info'
      const recommendation = getRouteRecommendation(marginPercent, slaPercent, route.alerts)

      return {
        alerts: route.alerts,
        averageKm,
        costPerKm: route.kmTotal ? Math.round(route.costTotal / route.kmTotal) : 0,
        costTotal: route.costTotal,
        freightCount: route.freightCount,
        id: route.id,
        marginAmount: route.marginAmount,
        marginPercent,
        recommendation,
        revenue: route.revenue,
        revenuePerKm: route.kmTotal ? Math.round(route.revenue / route.kmTotal) : 0,
        route: route.route,
        slaPercent,
        tone,
      }
    })
    .sort((first, second) => first.marginPercent - second.marginPercent)
}

function buildIncidentBreakdown(snapshot: Customer360Snapshot, freights: CustomerFreightLoad[]): CustomerIncidentBreakdown[] {
  const breakdown: CustomerIncidentBreakdown[] = [
    {
      count: freights.filter((freight) => freight.operation.risk.label.includes('vencido')).length,
      label: 'Atrasos',
      tone: 'danger',
    },
    {
      count: freights.filter((freight) => freight.truckLabel === 'Camion pendiente').length,
      label: 'Sin camion',
      tone: 'warning',
    },
    {
      count: freights.filter((freight) => freight.driverLabel === 'Chofer pendiente').length,
      label: 'Sin chofer',
      tone: 'warning',
    },
    {
      count: freights.filter((freight) => freight.documentsPending > 0).length,
      label: 'Documentos',
      tone: 'warning',
    },
    {
      count: freights.filter((freight) => freight.gpsLabel.includes('sin')).length,
      label: 'GPS',
      tone: 'warning',
    },
    {
      count: snapshot.conversations.filter((item) => item.priority === 'urgent' && item.status !== 'resolved').length,
      label: 'Reclamos',
      tone: 'danger',
    },
    {
      count: snapshot.metrics.pendingQuotes,
      label: 'Cotizaciones',
      tone: 'info',
    },
  ]

  return breakdown.filter((item) => item.count > 0)
}

function buildMapMarkers(freights: CustomerFreightLoad[]): CustomerMapMarker[] {
  return freights.slice(0, 8).map((freight, index) => ({
    href: freight.href,
    id: freight.operation.request.id,
    label: freight.freightNumber,
    left: [12, 28, 44, 62, 78, 20, 55, 84][index] || 50,
    meta: `${freight.truckLabel} / ${freight.gpsLabel}`,
    route: freight.routeLabel,
    status: freight.column,
    tone: freight.statusTone,
    top: [18, 44, 30, 62, 48, 72, 18, 76][index] || 50,
  }))
}

function buildOperationalTimeline(freights: CustomerFreightLoad[]): CustomerTimelineEvent[] {
  return freights
    .flatMap((freight) => buildFreightTimelineEvents(freight))
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
    .slice(0, 18)
}

function buildFreightTimelineEvents(freight: CustomerFreightLoad): CustomerTimelineEvent[] {
  const { assignment, quote, request } = freight.operation
  const events: CustomerTimelineEvent[] = [
    {
      actor: 'Cliente',
      date: request.createdAt,
      description: `${request.requestNumber}: ${request.cargoDescription}.`,
      done: true,
      href: freight.href,
      title: 'Solicitud creada',
      tone: 'success',
    },
  ]

  if (quote) {
    events.push({
      actor: 'Comercial',
      date: quote.sentAt || quote.validUntil,
      description: `${quote.quoteNumber} por ${quote.total.toLocaleString('es-CL')} CLP.`,
      done: Boolean(quote.sentAt),
      href: ROUTES.freightQuoteDetail(quote.id),
      title: quote.sentAt ? 'Cotizacion enviada' : 'Cotizacion preparada',
      tone: quote.status === 'APPROVED' ? 'success' : 'info',
    })
  }

  if (quote?.approvedAt || ['APPROVED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(request.status)) {
    events.push({
      actor: 'Cliente',
      date: quote?.approvedAt || request.updatedAt,
      description: `${request.requestNumber}: condiciones aprobadas o listas para programar.`,
      done: true,
      href: freight.href,
      title: 'Cotizacion aprobada',
      tone: 'success',
    })
  }

  if (assignment) {
    events.push({
      actor: assignment.assignedBy,
      date: assignment.createdAt,
      description: `${freight.truckLabel} y ${freight.driverLabel} asignados.`,
      done: true,
      href: ROUTES.freightAssignments,
      title: 'Camion y chofer asignados',
      tone: 'success',
    })
    events.push({
      actor: 'Despacho',
      date: assignment.pickupDate,
      description: `${request.requestNumber}: carga/retiro programado. ETA ${freight.etaLabel}.`,
      done: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(request.status),
      href: freight.href,
      title: 'Carga iniciada',
      tone: request.status === 'IN_TRANSIT' ? 'info' : 'success',
    })
  }

  if (request.status === 'IN_TRANSIT' || freight.column === 'incident') {
    events.push({
      actor: 'Trafico',
      date: request.updatedAt,
      description: `${request.requestNumber}: ${freight.gpsLabel}. ${freight.slaLabel}.`,
      done: request.status === 'IN_TRANSIT',
      href: ROUTES.telematics,
      title: freight.column === 'incident' ? 'Incidencia registrada' : 'Salida confirmada',
      tone: freight.column === 'incident' ? 'danger' : 'info',
    })
  }

  if (request.status === 'DELIVERED' || freight.column === 'finished' || freight.column === 'billed') {
    events.push({
      actor: 'Backoffice',
      date: assignment?.deliveryDate || request.updatedAt,
      description: `${request.requestNumber}: entrega finalizada, documentos y facturacion en control.`,
      done: true,
      href: ROUTES.driverTripSheets,
      title: freight.column === 'billed' ? 'Factura emitida' : 'Entrega finalizada',
      tone: freight.column === 'billed' ? 'success' : 'info',
    })
  }

  return events
}

function getMarginPercent({
  marginAmount,
  profitability,
  quoteTotal,
  tripSheet,
}: {
  marginAmount?: number
  profitability?: { marginPercentage: number }
  quoteTotal?: number
  tripSheet?: { netMargin: number; revenue: number }
}) {
  if (profitability) {
    return profitability.marginPercentage
  }

  if (tripSheet?.revenue) {
    return Math.round((tripSheet.netMargin / tripSheet.revenue) * 1000) / 10
  }

  if (marginAmount && quoteTotal) {
    return Math.round((marginAmount / quoteTotal) * 1000) / 10
  }

  return 18
}

function getGpsLabel(column: CustomerFreightColumnKey, riskLevel: FreightRequestOperation['risk']['level']) {
  if (riskLevel === 'critical') {
    return 'GPS sin actualizar'
  }

  if (column === 'inRoute') {
    return 'GPS online'
  }

  if (column === 'loading') {
    return 'En punto de carga'
  }

  if (column === 'assigned') {
    return 'Listo para salida'
  }

  if (column === 'finished' || column === 'billed') {
    return 'Cerrado'
  }

  return 'Sin GPS requerido'
}

function getSlaLabel(column: CustomerFreightColumnKey, riskLevel: FreightRequestOperation['risk']['level']) {
  if (riskLevel === 'critical') {
    return 'SLA critico'
  }

  if (column === 'incident') {
    return 'SLA en riesgo'
  }

  if (column === 'finished' || column === 'billed') {
    return 'SLA cumplido'
  }

  return 'SLA en tiempo'
}

function getDocumentsPending(column: CustomerFreightColumnKey, riskLevel: FreightRequestOperation['risk']['level'], quoteStatus?: string) {
  if (riskLevel === 'critical') {
    return 2
  }

  if (column === 'finished') {
    return 1
  }

  if (column === 'billed') {
    return 0
  }

  if (quoteStatus === 'SENT' || quoteStatus === 'DRAFT') {
    return 1
  }

  return column === 'incident' ? 2 : 0
}

function getBillingStatus(column: CustomerFreightColumnKey, tripSheetStatus?: string): CustomerFreightLoad['billingStatus'] {
  if (tripSheetStatus === 'PAID') {
    return 'paid'
  }

  if (column === 'billed') {
    return 'billed'
  }

  if (column === 'finished') {
    return 'pending'
  }

  return 'not-billed'
}

function buildDocumentItems(freights: CustomerFreightLoad[]): CustomerDocumentItem[] {
  return freights.flatMap((freight) => {
    const baseDueAt = freight.operation.assignment?.deliveryDate ||
      freight.operation.request.requestedPickupDate ||
      freight.operation.request.updatedAt
    const items: CustomerDocumentItem[] = []

    if (freight.documentsPending > 0) {
      items.push({
        dueAt: baseDueAt,
        freightNumber: freight.freightNumber,
        href: freight.href,
        id: `${freight.operation.request.id}-guide`,
        label: 'Guia despacho',
        status: freight.statusTone === 'danger' ? 'vencido' : 'faltante',
        tone: freight.statusTone === 'danger' ? 'danger' : 'warning',
      })
    }

    if (freight.column === 'finished' || freight.column === 'billed') {
      items.push({
        dueAt: baseDueAt,
        freightNumber: freight.freightNumber,
        href: ROUTES.driverTripSheets,
        id: `${freight.operation.request.id}-pod`,
        label: 'Comprobante entrega',
        status: freight.column === 'billed' ? 'ok' : 'pendiente',
        tone: freight.column === 'billed' ? 'success' : 'warning',
      })
    }

    if (freight.billingStatus !== 'not-billed') {
      items.push({
        dueAt: baseDueAt,
        freightNumber: freight.freightNumber,
        href: freight.href,
        id: `${freight.operation.request.id}-invoice`,
        label: 'Factura',
        status: freight.billingStatus === 'paid' || freight.billingStatus === 'billed' ? 'ok' : 'pendiente',
        tone: freight.billingStatus === 'paid' || freight.billingStatus === 'billed' ? 'success' : 'warning',
      })
    }

    return items
  })
}

function buildBillingItems(freights: CustomerFreightLoad[]): CustomerBillingItem[] {
  return freights
    .filter((freight) => freight.saleValue > 0)
    .map((freight) => {
      const status = getBillingItemStatus(freight)

      return {
        amount: freight.saleValue,
        dueAt: freight.operation.assignment?.deliveryDate ||
          freight.operation.request.requestedPickupDate ||
          freight.operation.request.updatedAt,
        freightNumber: freight.freightNumber,
        href: freight.href,
        id: `${freight.operation.request.id}-billing`,
        status,
        tone: getBillingTone(status),
      }
    })
}

function buildQuotationSummary(snapshot: Customer360Snapshot): CustomerQuotationSummary {
  const quotes = [...snapshot.freightQuotes, ...snapshot.workshopQuotes]
  const approved = quotes.filter((quote) => quote.status === 'APPROVED').length
  const totalAmount = quotes.reduce((total, quote) => total + Number(quote.total || 0), 0)

  return {
    approved,
    conversionRate: quotes.length ? Math.round((approved / quotes.length) * 100) : 0,
    expired: quotes.filter((quote) => quote.status === 'EXPIRED').length,
    pending: quotes.filter((quote) => quote.status === 'DRAFT' || quote.status === 'SENT').length,
    rejected: quotes.filter((quote) => quote.status === 'REJECTED').length,
    sent: quotes.filter((quote) => quote.status === 'SENT').length,
    totalAmount,
  }
}

function getBillingItemStatus(freight: CustomerFreightLoad): CustomerBillingItem['status'] {
  if (freight.billingStatus === 'paid') {
    return 'pagado'
  }

  if (freight.billingStatus === 'billed') {
    return 'facturado'
  }

  if (freight.column === 'finished') {
    return 'pendiente'
  }

  return freight.statusTone === 'danger' ? 'vencido' : 'pendiente'
}

function getBillingTone(status: CustomerBillingItem['status']): BadgeTone {
  if (status === 'pagado' || status === 'facturado') {
    return 'success'
  }

  return status === 'vencido' ? 'danger' : 'warning'
}

function getRouteRecommendation(marginPercent: number, slaPercent: number, alerts: number) {
  if (marginPercent < 0) {
    return 'bloquear o renegociar tarifa'
  }

  if (marginPercent < 12 || slaPercent < 80) {
    return 'revisar tarifa o condiciones'
  }

  if (alerts > 2) {
    return 'mantener con seguimiento SLA'
  }

  if (marginPercent >= 25 && slaPercent >= 90) {
    return 'mantener y priorizar'
  }

  return 'mantener tarifa'
}

function getProgressPercent(column: CustomerFreightColumnKey) {
  const progress: Record<CustomerFreightColumnKey, number> = {
    approved: 32,
    assigned: 46,
    billed: 100,
    finished: 94,
    inRoute: 68,
    incident: 54,
    loading: 56,
    quoting: 22,
    requestReceived: 12,
    unassigned: 38,
    unloading: 84,
  }

  return progress[column]
}

function compactPlace(value: string) {
  return value.split(',')[0]?.trim() || value
}

function formatOptionalDate(value?: string) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

function getRevenueTrend(monthly: CustomerMonthlyPoint[]): CustomerKpiTrend {
  const current = monthly.at(-1)?.revenue || 0
  const previous = monthly.at(-2)?.revenue || 0

  return buildTrend(current, previous, 'vs mes anterior')
}

function getMarginTrend(monthly: CustomerMonthlyPoint[]): CustomerKpiTrend {
  const current = monthly.at(-1)?.marginPercent || 0
  const previous = monthly.at(-2)?.marginPercent || 0

  return buildTrend(current, previous, 'margen')
}

function buildTrend(current: number, previous: number, suffix: string): CustomerKpiTrend {
  if (previous === 0 && current === 0) {
    return { direction: 'flat', label: 'sin variacion', tone: 'neutral' }
  }

  if (previous === 0) {
    return { direction: 'up', label: `+100% ${suffix}`, tone: 'success' }
  }

  const delta = Math.round(((current - previous) / previous) * 100)

  if (delta > 0) {
    return { direction: 'up', label: `+${delta}% ${suffix}`, tone: 'success' }
  }

  if (delta < 0) {
    return { direction: 'down', label: `${delta}% ${suffix}`, tone: 'warning' }
  }

  return { direction: 'flat', label: `0% ${suffix}`, tone: 'neutral' }
}

function getLastSixMonthLabels() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('es-CL', { month: 'short' })

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)

    return {
      key: getMonthKey(date.toISOString()),
      label: formatter.format(date).replace('.', ''),
    }
  })
}

function getMonthKey(value: string) {
  const date = new Date(value)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10
}

function getToneScore(tone: BadgeTone) {
  const scores: Record<BadgeTone, number> = {
    danger: 400,
    info: 200,
    neutral: 100,
    success: 0,
    warning: 300,
  }

  return scores[tone]
}

export function formatCustomerDelayLabel(hours?: number) {
  if (hours === undefined) {
    return 'Sin atraso'
  }

  return hours < 0 ? `Retraso ${formatHours(Math.abs(hours))}` : `Faltan ${formatHours(hours)}`
}
