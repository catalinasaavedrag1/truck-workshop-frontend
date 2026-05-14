import { ROUTES } from '../../../config/routes'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'

export type FreightFlowStage =
  | 'request'
  | 'quote'
  | 'approval'
  | 'assignment'
  | 'dispatch'
  | 'tracking'
  | 'closure'

export interface FreightFlowStep {
  key: FreightFlowStage
  label: string
  shortLabel: string
  description: string
}

export interface FreightPriority {
  label: string
  level: 'normal' | 'attention' | 'critical'
  reason: string
  tone: BadgeTone
}

export type FreightAttentionFilter =
  | 'all'
  | 'overdue'
  | 'unassigned'
  | 'approval'
  | 'ready-dispatch'
  | 'unquoted'

export type FreightRiskLevel = 'normal' | 'attention' | 'critical'

export interface FreightRisk {
  detail: string
  hoursToPickup?: number
  label: string
  level: FreightRiskLevel
  tone: BadgeTone
}

export interface FreightNextStep {
  actionLabel: string
  description: string
  label: string
  owner: string
  path: string
  tone: BadgeTone
}

export interface FreightQuickAction {
  label: string
  path: string
  tone?: BadgeTone
}

export interface FreightRequestOperation {
  assignment?: FreightAssignment
  averageHoldHours: number
  nextStep: FreightNextStep
  priority: FreightPriority
  quickActions: FreightQuickAction[]
  quote?: FreightQuote
  request: FreightRequest
  responsible: string
  risk: FreightRisk
  stage: FreightFlowStage
}

export interface FreightStageInsight {
  actionLabel: string
  averageHoldHours: number
  blockedCount: number
  count: number
  criticalCount: number
  description: string
  key: FreightFlowStage
  label: string
}

export const FREIGHT_FLOW_STEPS: FreightFlowStep[] = [
  {
    key: 'request',
    label: 'Solicitud',
    shortLabel: 'Solicitud',
    description: 'Cliente, ruta y carga',
  },
  {
    key: 'quote',
    label: 'Cotizacion',
    shortLabel: 'Cotiza',
    description: 'Tarifa y validez',
  },
  {
    key: 'approval',
    label: 'Aprobacion',
    shortLabel: 'Aprueba',
    description: 'Decision cliente',
  },
  {
    key: 'assignment',
    label: 'Asignacion',
    shortLabel: 'Asigna',
    description: 'Camion y chofer',
  },
  {
    key: 'dispatch',
    label: 'Despacho',
    shortLabel: 'Despacho',
    description: 'Salida programada',
  },
  {
    key: 'tracking',
    label: 'Seguimiento',
    shortLabel: 'Ruta',
    description: 'En transito',
  },
  {
    key: 'closure',
    label: 'Cierre',
    shortLabel: 'Cierre',
    description: 'Entrega final',
  },
]

export function getFreightStageIndex(stage: FreightFlowStage) {
  return FREIGHT_FLOW_STEPS.findIndex((step) => step.key === stage)
}

export function getFreightRequestStage(request: FreightRequest): FreightFlowStage {
  switch (request.status) {
    case 'NEW':
      return 'request'
    case 'QUOTING':
      return 'quote'
    case 'QUOTE_SENT':
      return 'approval'
    case 'APPROVED':
      return 'assignment'
    case 'ASSIGNED':
      return 'dispatch'
    case 'IN_TRANSIT':
      return 'tracking'
    case 'DELIVERED':
      return 'closure'
    case 'CANCELLED':
    case 'REJECTED':
      return 'approval'
    default:
      return 'request'
  }
}

export function getFreightPriority(request: FreightRequest, now = new Date()): FreightPriority {
  const pickupTime = request.requestedPickupDate ? new Date(request.requestedPickupDate).getTime() : undefined
  const hoursToPickup = pickupTime ? (pickupTime - now.getTime()) / 36e5 : undefined
  const isClosed = ['CANCELLED', 'DELIVERED', 'REJECTED'].includes(request.status)

  if (!isClosed && hoursToPickup !== undefined && hoursToPickup < 0) {
    return {
      label: 'Atrasado',
      level: 'critical',
      reason: 'Retiro vencido',
      tone: 'danger',
    }
  }

  if (!isClosed && hoursToPickup !== undefined && hoursToPickup <= 24) {
    return {
      label: '24 h',
      level: 'critical',
      reason: 'Retiro dentro de 24 h',
      tone: 'danger',
    }
  }

  if (['HAZARDOUS', 'OVERSIZED', 'REFRIGERATED'].includes(request.cargoType) && !request.assignedTruckId) {
    return {
      label: 'Especial',
      level: 'attention',
      reason: 'Carga requiere validacion operacional',
      tone: 'warning',
    }
  }

  if (request.status === 'APPROVED' && !request.assignedTruckId) {
    return {
      label: 'Asignar',
      level: 'attention',
      reason: 'Flete aprobado pendiente de camion y chofer',
      tone: 'warning',
    }
  }

  return {
    label: 'Normal',
    level: 'normal',
    reason: 'Sin alertas operacionales',
    tone: 'neutral',
  }
}

export function getFreightRisk(
  request: FreightRequest,
  quote?: FreightQuote,
  assignment?: FreightAssignment,
  now = new Date(),
): FreightRisk {
  const closed = ['CANCELLED', 'DELIVERED', 'REJECTED'].includes(request.status)
  const hoursToPickup = getHoursToPickup(request, now)
  const quoteExpiryHours = quote ? (new Date(quote.validUntil).getTime() - now.getTime()) / 36e5 : undefined

  if (closed) {
    return {
      detail: request.status === 'DELIVERED' ? 'Entrega confirmada' : 'Sin accion operacional',
      label: request.status === 'DELIVERED' ? 'Cerrada' : 'Detenida',
      level: 'normal',
      tone: request.status === 'DELIVERED' ? 'success' : 'neutral',
    }
  }

  if (hoursToPickup !== undefined && hoursToPickup < 0) {
    return {
      detail: `${formatHours(Math.abs(hoursToPickup))} de atraso`,
      hoursToPickup,
      label: 'Retiro vencido',
      level: 'critical',
      tone: 'danger',
    }
  }

  if (request.status === 'APPROVED' && !assignment && !request.assignedTruckId) {
    return {
      detail: 'Aprobada sin camion ni chofer',
      hoursToPickup,
      label: 'Sin camion',
      level: 'attention',
      tone: 'warning',
    }
  }

  if (request.status === 'QUOTE_SENT' && quoteExpiryHours !== undefined && quoteExpiryHours < 0) {
    return {
      detail: 'Cotizacion vencida sin decision',
      hoursToPickup,
      label: 'Cotizacion vencida',
      level: 'critical',
      tone: 'danger',
    }
  }

  if (hoursToPickup !== undefined && hoursToPickup <= 24) {
    return {
      detail: `Retiro en ${formatHours(hoursToPickup)}`,
      hoursToPickup,
      label: 'Retiro cercano',
      level: 'critical',
      tone: 'danger',
    }
  }

  if (request.status === 'QUOTE_SENT') {
    return {
      detail: quoteExpiryHours !== undefined ? `Validez en ${formatHours(Math.max(quoteExpiryHours, 0))}` : 'Cliente debe decidir',
      hoursToPickup,
      label: 'Cliente pendiente',
      level: 'attention',
      tone: 'warning',
    }
  }

  if (['HAZARDOUS', 'OVERSIZED', 'REFRIGERATED'].includes(request.cargoType) && !request.assignedTruckId) {
    return {
      detail: 'Carga especial requiere validacion',
      hoursToPickup,
      label: 'Carga especial',
      level: 'attention',
      tone: 'warning',
    }
  }

  return {
    detail: hoursToPickup !== undefined ? `Retiro en ${formatHours(hoursToPickup)}` : 'Sin bloqueo detectado',
    hoursToPickup,
    label: 'En control',
    level: 'normal',
    tone: 'success',
  }
}

export function getFreightNextStep(
  request: FreightRequest,
  quote?: FreightQuote,
  assignment?: FreightAssignment,
): FreightNextStep {
  if (request.status === 'NEW') {
    return {
      actionLabel: 'Cotizar',
      description: 'Falta convertir los datos de la solicitud en tarifa operable.',
      label: 'Cotizar solicitud',
      owner: 'Comercial',
      path: ROUTES.freightRequestDetail(request.id),
      tone: 'warning',
    }
  }

  if (request.status === 'QUOTING') {
    return {
      actionLabel: quote ? 'Editar tarifa' : 'Crear cotizacion',
      description: 'Completar costos, margen y condiciones para enviar al cliente.',
      label: 'Completar cotizacion',
      owner: 'Comercial',
      path: quote ? ROUTES.freightQuoteDetail(quote.id) : ROUTES.freightRequestDetail(request.id),
      tone: 'warning',
    }
  }

  if (request.status === 'QUOTE_SENT') {
    return {
      actionLabel: 'Contactar cliente',
      description: 'La operacion espera decision comercial del cliente.',
      label: 'Esperar aprobacion cliente',
      owner: 'Cliente',
      path: quote ? ROUTES.freightQuoteDetail(quote.id) : ROUTES.freightRequestDetail(request.id),
      tone: 'info',
    }
  }

  if (request.status === 'APPROVED' && !assignment && !request.assignedTruckId) {
    return {
      actionLabel: 'Asignar camion',
      description: 'Ya esta aprobada; falta camion, chofer y ventana de retiro.',
      label: 'Asignar camion y chofer',
      owner: 'Programacion',
      path: ROUTES.freightAssignments,
      tone: 'warning',
    }
  }

  if (request.status === 'APPROVED') {
    return {
      actionLabel: 'Programar despacho',
      description: 'Validar recursos y confirmar salida con cliente.',
      label: 'Programar despacho',
      owner: 'Programacion',
      path: ROUTES.freightAssignments,
      tone: 'info',
    }
  }

  if (request.status === 'ASSIGNED') {
    return {
      actionLabel: 'Confirmar retiro',
      description: 'Camion y chofer asignados; falta confirmar salida y retiro.',
      label: assignment?.status === 'SCHEDULED' ? 'Confirmar retiro' : 'Programar salida',
      owner: 'Despacho',
      path: ROUTES.driverTripSheets,
      tone: 'info',
    }
  }

  if (request.status === 'IN_TRANSIT') {
    return {
      actionLabel: 'Ver ruta',
      description: 'Mantener seguimiento activo y registrar incidencias si aparecen.',
      label: 'Iniciar seguimiento',
      owner: 'Trafico',
      path: ROUTES.telematics,
      tone: 'warning',
    }
  }

  if (request.status === 'DELIVERED') {
    return {
      actionLabel: 'Cerrar',
      description: 'Validar documentos y dejar la solicitud lista para facturacion.',
      label: 'Cerrar solicitud',
      owner: 'Backoffice',
      path: ROUTES.freightRequestDetail(request.id),
      tone: 'success',
    }
  }

  return {
    actionLabel: 'Ver detalle',
    description: 'Revisar motivo comercial y registrar aprendizaje.',
    label: request.status === 'REJECTED' ? 'Registrar rechazo' : 'Revisar cierre',
    owner: 'Comercial',
    path: ROUTES.freightRequestDetail(request.id),
    tone: 'neutral',
  }
}

export function getFreightQuickActions(
  request: FreightRequest,
  quote?: FreightQuote,
  assignment?: FreightAssignment,
): FreightQuickAction[] {
  const detail = { label: 'Ver detalle', path: ROUTES.freightRequestDetail(request.id) }

  switch (request.status) {
    case 'NEW':
      return [
        { label: 'Cotizar', path: ROUTES.freightRequestDetail(request.id), tone: 'warning' },
        { label: 'Editar', path: ROUTES.freightRequestDetail(request.id) },
        detail,
      ]
    case 'QUOTING':
      return [
        { label: quote ? 'Editar tarifa' : 'Crear cotizacion', path: quote ? ROUTES.freightQuoteDetail(quote.id) : ROUTES.freightRequestDetail(request.id), tone: 'warning' },
        detail,
      ]
    case 'QUOTE_SENT':
      return [
        { label: 'Registrar aprobacion', path: quote ? ROUTES.freightQuoteDetail(quote.id) : ROUTES.freightRequestDetail(request.id), tone: 'info' },
        { label: 'Contactar', path: ROUTES.communications },
        detail,
      ]
    case 'APPROVED':
      return [
        { label: assignment ? 'Ver asignacion' : 'Asignar camion', path: ROUTES.freightAssignments, tone: assignment ? 'info' : 'warning' },
        { label: 'Ver disponibilidad', path: ROUTES.fleetAvailability },
        detail,
      ]
    case 'ASSIGNED':
      return [
        { label: 'Programar salida', path: ROUTES.driverTripSheets, tone: 'info' },
        { label: 'Confirmar retiro', path: ROUTES.tripChecklistDeparture },
        detail,
      ]
    case 'IN_TRANSIT':
      return [
        { label: 'Ver ruta', path: ROUTES.telematics, tone: 'warning' },
        { label: 'Registrar incidencia', path: `${ROUTES.incidentsNew}?freightId=${encodeURIComponent(request.id)}` },
        detail,
      ]
    case 'DELIVERED':
      return [
        { label: 'Cerrar', path: ROUTES.freightRequestDetail(request.id), tone: 'success' },
        { label: 'Adjuntar docs', path: ROUTES.tripChecklistArrival },
        detail,
      ]
    default:
      return [detail]
  }
}

export function getFreightResponsible(request: FreightRequest) {
  const owners: Record<FreightRequest['status'], string> = {
    APPROVED: 'Programacion',
    ASSIGNED: 'Despacho',
    CANCELLED: 'Comercial',
    DELIVERED: 'Backoffice',
    IN_TRANSIT: 'Trafico',
    NEW: 'Comercial',
    QUOTE_SENT: 'Cliente',
    QUOTING: 'Comercial',
    REJECTED: 'Comercial',
  }

  return owners[request.status]
}

export function getFreightRequestOperation(
  request: FreightRequest,
  quotes: FreightQuote[] = [],
  assignments: FreightAssignment[] = [],
  now = new Date(),
): FreightRequestOperation {
  const quote = findQuoteForRequest(quotes, request)
  const assignment = findAssignmentForRequest(assignments, request.id)
  const stage = getFreightRequestStage(request)
  const risk = getFreightRisk(request, quote, assignment, now)
  const nextStep = getFreightNextStep(request, quote, assignment)

  return {
    assignment,
    averageHoldHours: getHoursSince(request.updatedAt || request.createdAt, now),
    nextStep,
    priority: getFreightPriority(request, now),
    quickActions: getFreightQuickActions(request, quote, assignment),
    quote,
    request,
    responsible: nextStep.owner || getFreightResponsible(request),
    risk,
    stage,
  }
}

export function getFreightStageInsights(
  requests: FreightRequest[],
  quotes: FreightQuote[] = [],
  assignments: FreightAssignment[] = [],
  now = new Date(),
): FreightStageInsight[] {
  const operations = requests.map((request) => getFreightRequestOperation(request, quotes, assignments, now))

  return FREIGHT_FLOW_STEPS.map((step) => {
    const stageOperations = operations.filter((operation) => operation.stage === step.key)
    const blockedCount = stageOperations.filter((operation) => isFreightOperationBlocked(operation)).length
    const totalHoldHours = stageOperations.reduce((sum, operation) => sum + operation.averageHoldHours, 0)
    const averageHoldHours = stageOperations.length ? Math.round(totalHoldHours / stageOperations.length) : 0

    return {
      actionLabel: getStageActionLabel(step.key),
      averageHoldHours,
      blockedCount,
      count: stageOperations.length,
      criticalCount: stageOperations.filter((operation) => operation.risk.level === 'critical').length,
      description: getStageOperationalDescription(step.key),
      key: step.key,
      label: step.label,
    }
  })
}

export function isFreightOperationBlocked(operation: FreightRequestOperation) {
  if (operation.risk.level === 'critical') {
    return true
  }

  if (operation.request.status === 'APPROVED' && !operation.assignment && !operation.request.assignedTruckId) {
    return true
  }

  if (operation.request.status === 'QUOTE_SENT') {
    return true
  }

  return operation.request.status === 'NEW' || operation.request.status === 'QUOTING'
}

export function matchesFreightAttentionFilter(
  filter: FreightAttentionFilter,
  request: FreightRequest,
  quotes: FreightQuote[] = [],
  assignments: FreightAssignment[] = [],
  now = new Date(),
) {
  const operation = getFreightRequestOperation(request, quotes, assignments, now)

  if (filter === 'all') {
    return true
  }

  if (filter === 'overdue') {
    return operation.risk.label === 'Retiro vencido' || operation.risk.label === 'Retiro cercano'
  }

  if (filter === 'unassigned') {
    return request.status === 'APPROVED' && !operation.assignment && !request.assignedTruckId
  }

  if (filter === 'approval') {
    return request.status === 'QUOTE_SENT'
  }

  if (filter === 'ready-dispatch') {
    return request.status === 'ASSIGNED' || operation.assignment?.status === 'SCHEDULED'
  }

  if (filter === 'unquoted') {
    return ['NEW', 'QUOTING'].includes(request.status) && !operation.quote
  }

  return true
}

export function getFreightRequestSearchText(request: FreightRequest, quote?: FreightQuote, assignment?: FreightAssignment) {
  return [
    request.requestNumber,
    request.customerName,
    request.customerPhone,
    request.customerEmail,
    request.originAddress,
    request.destinationAddress,
    request.cargoDescription,
    request.cargoType,
    request.status,
    request.requestedPickupDate,
    quote?.quoteNumber,
    quote?.status,
    assignment?.truckId,
    assignment?.driverId,
  ]
    .filter(Boolean)
    .join(' ')
}

export function getFreightQuotePriority(quote: FreightQuote, now = new Date()): FreightPriority {
  const hoursToExpiry = (new Date(quote.validUntil).getTime() - now.getTime()) / 36e5

  if (quote.status === 'SENT' && hoursToExpiry < 0) {
    return {
      label: 'Expirada',
      level: 'critical',
      reason: 'Validez comercial vencida',
      tone: 'danger',
    }
  }

  if (quote.status === 'SENT' && hoursToExpiry <= 24) {
    return {
      label: 'Vence hoy',
      level: 'attention',
      reason: 'Cotizacion enviada con decision pendiente',
      tone: 'warning',
    }
  }

  if (quote.status === 'APPROVED') {
    return {
      label: 'Aprobada',
      level: 'normal',
      reason: 'Lista para asignacion',
      tone: 'success',
    }
  }

  return {
    label: 'Seguimiento',
    level: 'normal',
    reason: 'Sin alerta comercial critica',
    tone: 'neutral',
  }
}

export function findAssignmentForRequest(assignments: FreightAssignment[], requestId: string) {
  return assignments.find((assignment) => assignment.requestId === requestId)
}

export function findQuoteForRequest(quotes: FreightQuote[], request: FreightRequest) {
  return quotes.find((quote) => quote.id === request.quoteId || quote.requestId === request.id)
}

export function getHoursToPickup(request: FreightRequest, now = new Date()) {
  if (!request.requestedPickupDate) {
    return undefined
  }

  return (new Date(request.requestedPickupDate).getTime() - now.getTime()) / 36e5
}

function getHoursSince(date: string, now = new Date()) {
  return Math.max(0, Math.round((now.getTime() - new Date(date).getTime()) / 36e5))
}

export function formatHours(hours: number) {
  const safeHours = Math.max(0, Math.round(hours))

  if (safeHours < 1) {
    return 'menos de 1 h'
  }

  if (safeHours < 24) {
    return `${safeHours} h`
  }

  const days = Math.floor(safeHours / 24)
  const remainingHours = safeHours % 24

  return remainingHours ? `${days} d ${remainingHours} h` : `${days} d`
}

function getStageActionLabel(stage: FreightFlowStage) {
  const actions: Record<FreightFlowStage, string> = {
    approval: 'gestionar aprobacion',
    assignment: 'asignar camion',
    closure: 'cerrar solicitud',
    dispatch: 'confirmar salida',
    quote: 'cotizar',
    request: 'calificar solicitud',
    tracking: 'actualizar ruta',
  }

  return actions[stage]
}

function getStageOperationalDescription(stage: FreightFlowStage) {
  const descriptions: Record<FreightFlowStage, string> = {
    approval: 'Decisiones de cliente y validez comercial.',
    assignment: 'Solicitudes aprobadas que necesitan recursos.',
    closure: 'Entregas listas para documentos y cierre.',
    dispatch: 'Salidas programadas y retiros por confirmar.',
    quote: 'Tarifas en calculo o pendientes de envio.',
    request: 'Solicitudes nuevas con datos base por validar.',
    tracking: 'Viajes activos, ruta, ETA e incidencias.',
  }

  return descriptions[stage]
}
