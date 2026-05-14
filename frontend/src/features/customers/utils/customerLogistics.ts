import { ROUTES } from '../../../config/routes'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightRequestOperation } from '../../freight/utils/freightOperations'
import { formatHours, getFreightRequestOperation } from '../../freight/utils/freightOperations'
import type { Customer360Alert, Customer360Snapshot } from './customer360'

export type CustomerFreightColumnKey =
  | 'pending'
  | 'assigned'
  | 'inRoute'
  | 'unloading'
  | 'incident'
  | 'finished'

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
  column: CustomerFreightColumnKey
  etaLabel: string
  freightNumber: string
  gpsLabel: string
  href: string
  marginPercent: number
  operation: FreightRequestOperation
  pickupLabel: string
  progressPercent: number
  routeLabel: string
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
  criticalSla: number
  incidentCount: number
  monthlyRevenue: number
  movedFreights: number
  otifPercent: number
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
  freightCount: number
  id: string
  marginPercent: number
  revenue: number
  route: string
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

export interface CustomerLogisticsIntelligence {
  alerts: CustomerOperationalAlert[]
  columns: CustomerFreightColumn[]
  executive: CustomerExecutiveKpis
  freights: CustomerFreightLoad[]
  incidents: CustomerIncidentBreakdown[]
  mapMarkers: CustomerMapMarker[]
  monthly: CustomerMonthlyPoint[]
  routes: CustomerRouteProfitability[]
  timeline: CustomerTimelineEvent[]
}

export const CUSTOMER_FREIGHT_COLUMNS: CustomerFreightColumn[] = [
  { description: 'Solicitudes, cotizaciones y aprobaciones por cerrar.', key: 'pending', label: 'Pendientes' },
  { description: 'Fletes con camion o chofer comprometido.', key: 'assigned', label: 'Asignados' },
  { description: 'Viajes activos que requieren trafico y ETA.', key: 'inRoute', label: 'En ruta' },
  { description: 'Entregas en descarga o cierre documental.', key: 'unloading', label: 'En descarga' },
  { description: 'Bloqueos, atrasos, SLA o GPS con problema.', key: 'incident', label: 'Incidencia' },
  { description: 'Viajes entregados o cerrados.', key: 'finished', label: 'Finalizados' },
]

const columnScore: Record<CustomerFreightColumnKey, number> = {
  incident: 600,
  inRoute: 500,
  unloading: 400,
  assigned: 300,
  pending: 200,
  finished: 100,
}

const criticalColumnTones: Record<CustomerFreightColumnKey, BadgeTone> = {
  assigned: 'info',
  finished: 'success',
  incident: 'danger',
  inRoute: 'info',
  pending: 'warning',
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

  return {
    alerts,
    columns: CUSTOMER_FREIGHT_COLUMNS,
    executive,
    freights,
    incidents,
    mapMarkers: buildMapMarkers(freights),
    monthly,
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
  const column = getFreightColumn(operation)
  const value = quote?.total || tripSheet?.revenue || profitability?.revenue || 0
  const marginPercent = getMarginPercent({ quoteTotal: quote?.total, marginAmount: quote?.marginAmount, profitability, tripSheet })
  const alerts = buildFreightAlerts(operation, column)

  return {
    alerts,
    column,
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
    slaLabel: getSlaLabel(column, operation.risk.level),
    statusTone: operation.risk.level === 'critical' ? 'danger' : criticalColumnTones[column],
    truckLabel: assignment?.truckId || request.assignedTruckId || tripSheet?.truckPlate || 'Camion pendiente',
    value,
  }
}

function getFreightColumn(operation: FreightRequestOperation): CustomerFreightColumnKey {
  if (['CANCELLED', 'REJECTED'].includes(operation.request.status)) {
    return 'incident'
  }

  if (operation.request.status === 'DELIVERED') {
    return 'finished'
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

  if (operation.request.status === 'ASSIGNED' || operation.assignment || operation.request.assignedTruckId) {
    return 'assigned'
  }

  return 'pending'
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
  const activeFreights = freights.filter((freight) => !['finished'].includes(freight.column)).length
  const finishedFreights = freights.filter((freight) => freight.column === 'finished').length
  const incidentCount = incidents.reduce((total, item) => total + item.count, 0)
  const monthlyRevenue = monthly.at(-1)?.revenue || snapshot.metrics.approvedRevenue || snapshot.metrics.pipelineTotal
  const averageMarginPercent = getAverage(freights.map((freight) => freight.marginPercent).filter((value) => value > 0))
  const onTimeBase = finishedFreights || Math.max(1, freights.length)
  const criticalSla = freights.filter((freight) => freight.slaLabel.includes('critico')).length +
    snapshot.workshopCases.filter((item) => item.slaStatus === 'BREACHED').length

  return {
    activeFreights,
    averageMarginPercent,
    criticalSla,
    incidentCount,
    marginTrend: getMarginTrend(monthly),
    monthlyRevenue,
    movedFreights: freights.length,
    otifPercent: Math.max(0, Math.round(((onTimeBase - criticalSla) / onTimeBase) * 100)),
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
  const routeMap = new Map<string, CustomerRouteProfitability & { marginTotal: number }>()

  for (const freight of freights) {
    const current = routeMap.get(freight.routeLabel) || {
      alerts: 0,
      freightCount: 0,
      id: freight.routeLabel,
      marginPercent: 0,
      marginTotal: 0,
      revenue: 0,
      route: freight.routeLabel,
      tone: 'neutral' as BadgeTone,
    }

    current.alerts += freight.alerts.filter((alert) => alert.tone === 'danger' || alert.tone === 'warning').length
    current.freightCount += 1
    current.marginTotal += freight.marginPercent
    current.revenue += freight.value
    routeMap.set(freight.routeLabel, current)
  }

  return [...routeMap.values()]
    .map((route) => {
      const marginPercent = route.freightCount ? Math.round((route.marginTotal / route.freightCount) * 10) / 10 : 0
      const tone: BadgeTone = marginPercent < 12 || route.alerts > 0
        ? 'warning'
        : marginPercent >= 25
          ? 'success'
          : 'info'

      return {
        alerts: route.alerts,
        freightCount: route.freightCount,
        id: route.id,
        marginPercent,
        revenue: route.revenue,
        route: route.route,
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
  const selected = freights.find((freight) => freight.column !== 'finished') || freights[0]

  if (!selected) {
    return []
  }

  const { assignment, quote, request } = selected.operation
  const events: CustomerTimelineEvent[] = [
    {
      actor: 'Cliente',
      date: request.createdAt,
      description: `${request.customerName} solicita ${request.cargoDescription}.`,
      done: true,
      href: selected.href,
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
      title: 'Cotizacion enviada',
      tone: quote.status === 'APPROVED' ? 'success' : 'info',
    })
  }

  events.push({
    actor: quote?.status === 'APPROVED' ? 'Cliente' : 'Comercial',
    date: quote?.approvedAt || request.updatedAt,
    description: quote?.status === 'APPROVED' ? 'Condiciones aprobadas por cliente.' : 'Decision comercial pendiente.',
    done: quote?.status === 'APPROVED' || ['APPROVED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(request.status),
    href: selected.href,
    title: 'Aprobacion',
    tone: quote?.status === 'APPROVED' ? 'success' : 'warning',
  })

  if (assignment) {
    events.push({
      actor: assignment.assignedBy,
      date: assignment.createdAt,
      description: `${selected.truckLabel} y ${selected.driverLabel} asignados.`,
      done: true,
      href: ROUTES.freightAssignments,
      title: 'Asignacion',
      tone: 'success',
    })
    events.push({
      actor: 'Despacho',
      date: assignment.pickupDate,
      description: `Retiro programado. ETA ${selected.etaLabel}.`,
      done: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(request.status),
      href: selected.href,
      title: 'Carga realizada',
      tone: request.status === 'IN_TRANSIT' ? 'info' : 'success',
    })
  }

  events.push({
    actor: 'Trafico',
    date: request.updatedAt,
    description: selected.column === 'inRoute' ? 'Seguimiento en ruta activo.' : 'Monitoreo pendiente segun estado.',
    done: ['IN_TRANSIT', 'DELIVERED'].includes(request.status),
    href: ROUTES.telematics,
    title: 'En transito',
    tone: selected.column === 'incident' ? 'danger' : 'info',
  })

  events.push({
    actor: 'Backoffice',
    date: assignment?.deliveryDate || request.updatedAt,
    description: request.status === 'DELIVERED' ? 'Entrega confirmada y lista para facturar.' : 'Pendiente entrega y documentos.',
    done: request.status === 'DELIVERED',
    href: ROUTES.driverTripSheets,
    title: 'Descargado / facturado',
    tone: request.status === 'DELIVERED' ? 'success' : 'neutral',
  })

  return events.sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
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

  if (column === 'assigned') {
    return 'Listo para salida'
  }

  if (column === 'finished') {
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

  if (column === 'finished') {
    return 'SLA cumplido'
  }

  return 'SLA en tiempo'
}

function getProgressPercent(column: CustomerFreightColumnKey) {
  const progress: Record<CustomerFreightColumnKey, number> = {
    assigned: 48,
    finished: 100,
    inRoute: 68,
    incident: 52,
    pending: 24,
    unloading: 86,
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
