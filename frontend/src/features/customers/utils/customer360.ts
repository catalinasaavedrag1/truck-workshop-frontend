import { ROUTES } from '../../../config/routes'
import type { CommunicationConversation, CommunicationQuoteLink } from '../../communications/types/communication.types'
import type { DriverTripSheet } from '../../driver-trip-sheets/types/driverTripSheet.types'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../../freight/types/freight.types'
import type { FreightProfitability } from '../../freight-profitability/types/freightProfitability.types'
import type { Quote } from '../../quotes/types/quote.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import type { Customer } from '../types/customer.types'
import { getCreditUsagePercent } from './customerPricing'

export type CustomerActivityKind =
  | 'case'
  | 'communication'
  | 'freight'
  | 'freight-assignment'
  | 'freight-quote'
  | 'profitability'
  | 'trip-sheet'
  | 'workshop-quote'

export interface Customer360SourceData {
  conversations: CommunicationConversation[]
  customer: Customer
  freightAssignments: FreightAssignment[]
  freightProfitability: FreightProfitability[]
  freightQuotes: FreightQuote[]
  freightRequests: FreightRequest[]
  quoteLinks: CommunicationQuoteLink[]
  tripSheets: DriverTripSheet[]
  workshopCases: WorkshopCase[]
  workshopQuotes: Quote[]
}

export interface Customer360Alert {
  label: string
  message: string
  tone: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
}

export interface CustomerActivityItem {
  date?: string
  description: string
  href?: string
  id: string
  kind: CustomerActivityKind
  meta?: string
  title: string
}

export interface Customer360Metrics {
  activeOperations: number
  approvedRevenue: number
  creditAvailable: number
  creditUsagePercent: number
  grossMargin: number
  lastActivityAt?: string
  netMargin: number
  openCommunications: number
  openWorkshopCases: number
  pendingQuotes: number
  pipelineTotal: number
  profitabilityMarginPercent: number
}

export interface Customer360Snapshot {
  activity: CustomerActivityItem[]
  alerts: Customer360Alert[]
  conversations: CommunicationConversation[]
  customer: Customer
  freightAssignments: FreightAssignment[]
  freightProfitability: FreightProfitability[]
  freightQuotes: FreightQuote[]
  freightRequests: FreightRequest[]
  metrics: Customer360Metrics
  quoteLinks: CommunicationQuoteLink[]
  tripSheets: DriverTripSheet[]
  workshopCases: WorkshopCase[]
  workshopQuotes: Quote[]
}

type CustomerReference = {
  contactAddress?: string | null
  customer?: string | null
  customerId?: string | null
  customerName?: string | null
  relatedEntityId?: string | null
  relatedEntityLabel?: string | null
  relatedEntityType?: string | null
}

const closedCaseStatuses = new Set(['closed'])
const inactiveFreightStatuses = new Set(['CANCELLED', 'DELIVERED', 'REJECTED'])
const pendingQuoteStatuses = new Set(['DRAFT', 'SENT'])
const approvedQuoteStatuses = new Set(['APPROVED'])
const openConversationStatuses = new Set(['open', 'pending'])

export function buildCustomer360Snapshot(source: Customer360SourceData): Customer360Snapshot {
  const { customer } = source
  const workshopCases = source.workshopCases.filter((item) => matchesCustomerRecord(customer, item))
  const freightRequests = source.freightRequests.filter((item) => matchesCustomerRecord(customer, item))
  const freightQuotes = source.freightQuotes.filter((item) => matchesCustomerRecord(customer, item))
  const workshopQuotes = source.workshopQuotes.filter(
    (item) => matchesCustomerRecord(customer, item) || workshopCases.some((workshopCase) => workshopCase.id === item.caseId),
  )

  const freightRequestIds = new Set(freightRequests.map((item) => item.id))
  const freightQuoteIds = new Set(freightQuotes.map((item) => item.id))
  const workshopCaseIds = new Set(workshopCases.map((item) => item.id))
  const workshopQuoteIds = new Set(workshopQuotes.map((item) => item.id))
  const relatedEntityIds = new Set([
    ...freightRequestIds,
    ...freightQuoteIds,
    ...workshopCaseIds,
    ...workshopQuoteIds,
    customer.id,
  ])

  const quoteLinks = source.quoteLinks.filter(
    (item) =>
      matchesCustomerRecord(customer, item) ||
      freightQuoteIds.has(item.quoteId) ||
      workshopQuoteIds.has(item.quoteId) ||
      relatedEntityIds.has(item.conversationId),
  )
  const conversationIdsFromLinks = new Set(quoteLinks.map((item) => item.conversationId))
  const conversations = source.conversations.filter(
    (item) =>
      matchesCustomerRecord(customer, item) ||
      conversationIdsFromLinks.has(item.id) ||
      relatedEntityIds.has(item.relatedEntityId || ''),
  )
  const freightAssignments = source.freightAssignments.filter(
    (item) => freightRequestIds.has(item.requestId) || freightQuoteIds.has(item.quoteId),
  )
  const assignmentIds = new Set(freightAssignments.map((item) => item.id))
  const tripSheets = source.tripSheets.filter(
    (item) =>
      matchesCustomerRecord(customer, item) ||
      freightRequestIds.has(item.requestId || '') ||
      freightQuoteIds.has(item.quoteId || '') ||
      assignmentIds.has(item.assignmentId || ''),
  )
  const freightProfitability = source.freightProfitability.filter(
    (item) => matchesCustomerRecord(customer, item) || freightRequestIds.has(item.freightId),
  )

  const activity = buildCustomerActivity({
    conversations,
    freightAssignments,
    freightProfitability,
    freightQuotes,
    freightRequests,
    tripSheets,
    workshopCases,
    workshopQuotes,
  })
  const metrics = buildCustomerMetrics({
    activity,
    conversations,
    customer,
    freightProfitability,
    freightQuotes,
    freightRequests,
    tripSheets,
    workshopCases,
    workshopQuotes,
  })
  const alerts = buildCustomerAlerts({ conversations, customer, freightAssignments, freightRequests, metrics, workshopCases })

  return {
    activity,
    alerts,
    conversations,
    customer,
    freightAssignments,
    freightProfitability,
    freightQuotes,
    freightRequests,
    metrics,
    quoteLinks,
    tripSheets,
    workshopCases,
    workshopQuotes,
  }
}

export function matchesCustomerRecord(customer: Customer, record: CustomerReference) {
  if (record.customerId && record.customerId === customer.id) {
    return true
  }

  if (record.relatedEntityType === 'customer' && record.relatedEntityId === customer.id) {
    return true
  }

  const customerName = normalizeCustomerText(customer.name)
  const nameCandidates = [record.customerName, record.customer, record.relatedEntityLabel]

  if (nameCandidates.some((value) => normalizeCustomerText(value) === customerName)) {
    return true
  }

  const email = normalizeCustomerText(customer.email)
  const phone = normalizeCustomerText(customer.phone).replace(/\s/g, '')
  const contactAddress = normalizeCustomerText(record.contactAddress).replace(/\s/g, '')

  return Boolean(
    contactAddress &&
      ((email && normalizeCustomerText(record.contactAddress) === email) || (phone && contactAddress === phone)),
  )
}

export function normalizeCustomerText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function buildCustomerMetrics({
  activity,
  conversations,
  customer,
  freightProfitability,
  freightQuotes,
  freightRequests,
  tripSheets,
  workshopCases,
  workshopQuotes,
}: Pick<
  Customer360Snapshot,
  | 'activity'
  | 'conversations'
  | 'customer'
  | 'freightProfitability'
  | 'freightQuotes'
  | 'freightRequests'
  | 'tripSheets'
  | 'workshopCases'
  | 'workshopQuotes'
>): Customer360Metrics {
  const openWorkshopCases = workshopCases.filter((item) => !closedCaseStatuses.has(item.status)).length
  const activeFreightRequests = freightRequests.filter((item) => !inactiveFreightStatuses.has(item.status)).length
  const pendingFreightQuotes = freightQuotes.filter((item) => pendingQuoteStatuses.has(item.status)).reduce(sumTotal, 0)
  const pendingWorkshopQuotes = workshopQuotes.filter((item) => pendingQuoteStatuses.has(item.status)).reduce(sumTotal, 0)
  const approvedFreightQuotes = freightQuotes.filter((item) => approvedQuoteStatuses.has(item.status)).reduce(sumTotal, 0)
  const approvedWorkshopQuotes = workshopQuotes.filter((item) => approvedQuoteStatuses.has(item.status)).reduce(sumTotal, 0)
  const tripRevenue = tripSheets.reduce((total, item) => total + toNumber(item.revenue), 0)
  const profitabilityRevenue = freightProfitability.reduce((total, item) => total + toNumber(item.revenue), 0)
  const grossMargin = freightProfitability.reduce((total, item) => total + toNumber(item.grossMargin), 0)
  const netMargin =
    freightProfitability.length > 0
      ? freightProfitability.reduce((total, item) => total + toNumber(item.netMargin), 0)
      : tripSheets.reduce((total, item) => total + toNumber(item.netMargin), 0)
  const revenueBase = profitabilityRevenue || tripRevenue

  return {
    activeOperations: activeFreightRequests + openWorkshopCases,
    approvedRevenue: approvedFreightQuotes + approvedWorkshopQuotes + tripRevenue,
    creditAvailable: Math.max(0, toNumber(customer.creditLimit) - toNumber(customer.creditUsed)),
    creditUsagePercent: getCreditUsagePercent(customer),
    grossMargin,
    lastActivityAt: activity[0]?.date,
    netMargin,
    openCommunications: conversations.filter((item) => openConversationStatuses.has(item.status)).length,
    openWorkshopCases,
    pendingQuotes: freightQuotes.filter((item) => pendingQuoteStatuses.has(item.status)).length +
      workshopQuotes.filter((item) => pendingQuoteStatuses.has(item.status)).length,
    pipelineTotal: pendingFreightQuotes + pendingWorkshopQuotes,
    profitabilityMarginPercent: revenueBase > 0 ? Math.round((netMargin / revenueBase) * 1000) / 10 : 0,
  }
}

function buildCustomerAlerts({
  conversations,
  customer,
  freightAssignments,
  freightRequests,
  metrics,
  workshopCases,
}: Pick<Customer360Snapshot, 'conversations' | 'customer' | 'freightAssignments' | 'freightRequests' | 'metrics' | 'workshopCases'>) {
  const alerts: Customer360Alert[] = []
  const criticalCases = workshopCases.filter((item) => item.priority === 'critical' || item.slaStatus === 'BREACHED')
  const unassignedApprovedFreights = freightRequests.filter((request) => {
    if (request.status !== 'APPROVED') {
      return false
    }

    return !freightAssignments.some((assignment) => assignment.requestId === request.id)
  })
  const urgentConversations = conversations.filter((item) => item.priority === 'urgent' && openConversationStatuses.has(item.status))

  if (customer.status !== 'active') {
    alerts.push({
      label: 'Estado comercial',
      message: `Cliente ${customer.status}. Validar antes de crear nuevas operaciones.`,
      tone: customer.status === 'suspended' ? 'danger' : 'warning',
    })
  }

  if (customer.riskLevel === 'high' || metrics.creditUsagePercent >= 90) {
    alerts.push({
      label: 'Credito y riesgo',
      message: customer.creditEnabled
        ? `Uso de credito en ${metrics.creditUsagePercent}%. Revisar cupo disponible.`
        : 'Cliente sin linea de credito. Operar con anticipo o aprobacion manual.',
      tone: 'warning',
    })
  }

  if (criticalCases.length > 0) {
    alerts.push({
      label: 'Taller critico',
      message: `${criticalCases.length} caso(s) con prioridad critica o SLA vencido.`,
      tone: 'danger',
    })
  }

  if (unassignedApprovedFreights.length > 0) {
    alerts.push({
      label: 'Despacho pendiente',
      message: `${unassignedApprovedFreights.length} flete(s) aprobados sin asignacion registrada.`,
      tone: 'warning',
    })
  }

  if (urgentConversations.length > 0) {
    alerts.push({
      label: 'Comunicacion urgente',
      message: `${urgentConversations.length} conversacion(es) urgentes abiertas con el cliente.`,
      tone: 'danger',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      label: 'Cliente operativo',
      message: 'Sin alertas comerciales u operacionales relevantes.',
      tone: 'success',
    })
  }

  return alerts
}

function buildCustomerActivity({
  conversations,
  freightAssignments,
  freightProfitability,
  freightQuotes,
  freightRequests,
  tripSheets,
  workshopCases,
  workshopQuotes,
}: Pick<
  Customer360Snapshot,
  | 'conversations'
  | 'freightAssignments'
  | 'freightProfitability'
  | 'freightQuotes'
  | 'freightRequests'
  | 'tripSheets'
  | 'workshopCases'
  | 'workshopQuotes'
>): CustomerActivityItem[] {
  const items: CustomerActivityItem[] = [
    ...workshopCases.map((item) => ({
      date: item.updatedAt || item.createdAt,
      description: `${item.truckPlate} - ${item.failureDescription}`,
      href: ROUTES.caseDetail(item.id),
      id: `case-${item.id}`,
      kind: 'case' as const,
      meta: item.status,
      title: item.caseNumber,
    })),
    ...freightRequests.map((item) => ({
      date: item.updatedAt || item.createdAt,
      description: `${item.originAddress} -> ${item.destinationAddress}`,
      href: ROUTES.freightRequestDetail(item.id),
      id: `freight-${item.id}`,
      kind: 'freight' as const,
      meta: item.status,
      title: item.requestNumber,
    })),
    ...freightQuotes.map((item) => ({
      date: item.approvedAt || item.sentAt || item.validUntil,
      description: `Cotizacion de flete por ${item.estimatedKm.toLocaleString('es-CL')} km`,
      href: ROUTES.freightQuoteDetail(item.id),
      id: `freight-quote-${item.id}`,
      kind: 'freight-quote' as const,
      meta: item.status,
      title: item.quoteNumber,
    })),
    ...workshopQuotes.map((item) => ({
      date: item.updatedAt || item.createdAt,
      description: item.diagnosisSummary,
      href: ROUTES.quoteDetail(item.id),
      id: `workshop-quote-${item.id}`,
      kind: 'workshop-quote' as const,
      meta: item.status,
      title: item.quoteNumber,
    })),
    ...freightAssignments.map((item) => ({
      date: item.updatedAt || item.pickupDate || item.createdAt,
      description: `Camion ${item.truckId} - chofer ${item.driverId}`,
      href: ROUTES.freightAssignments,
      id: `assignment-${item.id}`,
      kind: 'freight-assignment' as const,
      meta: item.status,
      title: 'Asignacion de flete',
    })),
    ...tripSheets.map((item) => ({
      date: item.updatedAt || item.deliveredAt || item.tripDate,
      description: `${item.originAddress || 'Origen pendiente'} -> ${item.destinationAddress || 'Destino pendiente'}`,
      href: `${ROUTES.driverTripSheets}?query=${encodeURIComponent(item.sheetNumber)}`,
      id: `trip-sheet-${item.id}`,
      kind: 'trip-sheet' as const,
      meta: item.status,
      title: item.sheetNumber,
    })),
    ...freightProfitability.map((item) => ({
      description: `Margen ${item.marginPercentage}% en ${item.km.toLocaleString('es-CL')} km`,
      href: `${ROUTES.freightProfitability}?query=${encodeURIComponent(item.freightId)}`,
      id: `profitability-${item.id}`,
      kind: 'profitability' as const,
      meta: item.freightId,
      title: 'Rentabilidad de flete',
    })),
    ...conversations.map((item) => ({
      date: item.lastMessageAt || item.updatedAt || item.createdAt,
      description: item.lastMessagePreview,
      href: `${ROUTES.communications}?query=${encodeURIComponent(item.subject)}`,
      id: `conversation-${item.id}`,
      kind: 'communication' as const,
      meta: item.status,
      title: item.subject,
    })),
  ]

  return items.sort((first, second) => getTime(second.date) - getTime(first.date))
}

function sumTotal(total: number, item: { total?: number }) {
  return total + toNumber(item.total)
}

function getTime(value?: string) {
  return value ? new Date(value).getTime() || 0 : 0
}

function toNumber(value: unknown) {
  const number = Number(value || 0)

  return Number.isFinite(number) ? number : 0
}
