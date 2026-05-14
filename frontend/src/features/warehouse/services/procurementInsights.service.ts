import { ROUTES } from '../../../config/routes'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { Part } from '../../parts/types/part.types'
import type { PurchaseOrder, PurchaseRequest } from '../../purchase-orders/types/purchaseOrder.types'
import type { Supplier } from '../../suppliers/types/supplier.types'
import {
  buyerPerformanceMock,
  categorySupplyHealthMock,
  documentControlMock,
  operationalBlockersMock,
  procurementKpisMock,
  procurementPurchaseOrdersMock,
  purchaseAuditAlertsMock,
  purchaseReceiptsMock,
  purchaseRequestsMock,
  purchaseSuggestionsMock,
  replenishmentCalendarMock,
  skuCoverageMock,
  stockHealthMock,
  supplierPerformanceMock,
  supplierSkuComparisonMock,
} from '../mocks/procurement.mock'
import type {
  BuyerPerformance,
  ProcurementPurchaseOrder,
  ProcurementRisk,
  PurchaseRequestDecision,
  PurchaseSuggestion,
  StockHealth,
  SupplierPerformance,
} from '../types/procurement.types'
import type { WarehouseStockItem } from '../types/warehouse.types'

const openOrderStatuses = new Set([
  'DRAFT',
  'REQUESTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'ORDERED',
  'PARTIALLY_RECEIVED',
  'OVERDUE',
  'WITH_DIFFERENCE',
  'DOCUMENT_BLOCKED',
])

interface ProcurementDashboardContext {
  parts?: Part[]
  purchaseOrders?: PurchaseOrder[]
  purchaseRequests?: PurchaseRequest[]
  stockItems?: WarehouseStockItem[]
  suppliers?: Supplier[]
}

function getTotalItems(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

function getRiskFromOrder(order: PurchaseOrder): ProcurementRisk {
  if (order.status === 'CANCELLED' || order.status === 'ANNULLED') {
    return 'low'
  }

  if (new Date(order.expectedDeliveryDate).getTime() < Date.now() && openOrderStatuses.has(order.status)) {
    return 'high'
  }

  if (order.status === 'PARTIALLY_RECEIVED' || order.status === 'DOCUMENT_BLOCKED' || order.status === 'WITH_DIFFERENCE') {
    return 'high'
  }

  return openOrderStatuses.has(order.status) ? 'medium' : 'low'
}

function getOverdueDays(expectedDeliveryDate: string) {
  const elapsed = Date.now() - new Date(expectedDeliveryDate).getTime()

  return elapsed > 0 ? Math.ceil(elapsed / 86_400_000) : 0
}

export function getProcurementPurchaseOrders(orders: PurchaseOrder[] = []): ProcurementPurchaseOrder[] {
  const enrichedById = new Map(procurementPurchaseOrdersMock.map((order) => [order.purchaseOrderId, order]))
  const incomingIds = new Set(orders.map((order) => order.id))
  const adaptedOrders = orders.map<ProcurementPurchaseOrder>((order) => {
    const enriched = enrichedById.get(order.id)

    return {
      alerts: enriched?.alerts ?? [],
      category: enriched?.category ?? order.items[0]?.name ?? 'General',
      cases: enriched?.cases ?? (order.relatedCaseId ? [{ id: order.relatedCaseId, label: order.relatedCaseId, type: 'case' }] : []),
      createdAt: enriched?.createdAt ?? order.createdAt,
      documentsStatus: enriched?.documentsStatus ?? 'Pendiente validacion',
      itemsCount: enriched?.itemsCount ?? getTotalItems(order),
      overdueDays: enriched?.overdueDays ?? getOverdueDays(order.expectedDeliveryDate),
      promisedAt: enriched?.promisedAt ?? order.expectedDeliveryDate,
      purchaseOrderId: order.id,
      purchaseOrderNumber: enriched?.purchaseOrderNumber ?? order.purchaseOrderNumber,
      receptionStatus: enriched?.receptionStatus ?? (order.status === 'RECEIVED' ? 'Recibida' : 'Pendiente'),
      requestIds: enriched?.requestIds ?? [],
      responsible: enriched?.responsible ?? order.requestedBy ?? order.createdBy ?? 'Sistema',
      risk: enriched?.risk ?? getRiskFromOrder(order),
      status: enriched?.status ?? order.status,
      supplierId: enriched?.supplierId ?? '',
      supplierName: enriched?.supplierName ?? order.supplierName,
      total: enriched?.total ?? order.totalEstimated,
    }
  })
  const extraMocks = procurementPurchaseOrdersMock.filter((order) => !incomingIds.has(order.purchaseOrderId))

  return [...adaptedOrders, ...extraMocks]
}

export function getProcurementDashboard(context: PurchaseOrder[] | ProcurementDashboardContext = []) {
  const source = Array.isArray(context) ? { purchaseOrders: context } : context
  const sourceOrders = source.purchaseOrders ?? []
  const purchaseOrders = getProcurementPurchaseOrders(sourceOrders)
  const purchaseRequests = getProcurementPurchaseRequests(source.purchaseRequests)
  const suppliers = getSupplierPerformance(source.suppliers, purchaseOrders)
  const stockHealth = getStockHealth(source.stockItems, source.parts)
  const openAmount = purchaseOrders
    .filter((order) => openOrderStatuses.has(order.status))
    .reduce((total, order) => total + order.total, 0)

  return {
    auditAlerts: purchaseAuditAlertsMock,
    blockers: operationalBlockersMock,
    buyerPerformance: buyerPerformanceMock,
    calendar: replenishmentCalendarMock,
    categories: categorySupplyHealthMock,
    documents: documentControlMock,
    kpis: procurementKpisMock.map((kpi) => (kpi.id === 'open-po' ? { ...kpi, value: formatCurrency(openAmount) } : kpi)),
    purchaseOrders,
    receipts: purchaseReceiptsMock,
    requests: purchaseRequests,
    skuCoverage: skuCoverageMock,
    stockHealth,
    suggestions: purchaseSuggestionsMock,
    suppliers,
    supplierSkuComparison: supplierSkuComparisonMock,
  }
}

function getProcurementPurchaseRequests(requests: PurchaseRequest[] | undefined): PurchaseRequestDecision[] {
  if (!requests?.length) {
    return purchaseRequestsMock
  }

  const enrichedBySku = new Map(purchaseRequestsMock.map((request) => [request.sku, request]))

  return requests.map((request) => {
    const enriched = enrichedBySku.get(request.sku)
    const state = mapRequestStatus(request.status)

    return {
      action: state === 'Aprobada' ? 'Convertir en OC' : state === 'En revision' ? 'Aprobar' : 'Revisar trazabilidad',
      cases: request.caseId ? [{ id: request.caseId, label: request.caseId, type: 'case' }] : [],
      createdAt: request.createdAt,
      id: request.id,
      justification: enriched?.justification ?? 'Solicitud recibida desde backend; pendiente de enriquecer con cobertura y demanda.',
      origin: enriched?.origin ?? 'Solicitud backend',
      purchaseOrderId: request.purchaseOrderId,
      purchaseOrderNumber: enriched?.purchaseOrderNumber,
      requestedBy: request.requestedBy,
      requestedQuantity: request.quantity,
      responsible: enriched?.responsible ?? request.requestedBy,
      risk: enriched?.risk ?? (request.status === 'open' ? 'high' : 'medium'),
      sku: request.sku,
      sla: enriched?.sla ?? '1 d',
      state,
      suggestedQuantity: enriched?.suggestedQuantity ?? request.quantity,
    }
  })
}

function mapRequestStatus(status: PurchaseRequest['status']): PurchaseRequestDecision['state'] {
  const states: Record<PurchaseRequest['status'], PurchaseRequestDecision['state']> = {
    cancelled: 'Cancelada',
    linked_to_po: 'Convertida en OC',
    open: 'En revision',
    received: 'Cerrada',
  }

  return states[status] ?? 'Detectada'
}

function getSupplierPerformance(suppliers: Supplier[] | undefined, purchaseOrders: ProcurementPurchaseOrder[]): SupplierPerformance[] {
  if (!suppliers?.length) {
    return supplierPerformanceMock
  }

  const enrichedById = new Map(supplierPerformanceMock.map((supplier) => [supplier.supplierId, supplier]))

  return suppliers.map((supplier) => {
    const enriched = enrichedById.get(supplier.id)
    const supplierOrders = purchaseOrders.filter((order) => order.supplierName === supplier.name || order.supplierId === supplier.id)
    const delayedDeliveries = supplierOrders.filter((order) => order.overdueDays > 0).length
    const partialReceipts = supplierOrders.filter((order) => order.receptionStatus.toLowerCase().includes('parcial')).length

    return {
      activePurchaseOrders: supplier.activePurchaseOrderIds.length || supplierOrders.filter((order) => openOrderStatuses.has(order.status)).length,
      categories: supplier.categories,
      claimCount: enriched?.claimCount ?? 0,
      completeDeliveries: enriched?.completeDeliveries ?? Math.max(0, supplierOrders.length - delayedDeliveries),
      contact: supplier.contactName,
      delayedDeliveries,
      lastPurchaseAt: enriched?.lastPurchaseAt ?? supplier.updatedAt ?? supplier.createdAt,
      leadTimePromisedDays: supplier.averageDeliveryDays,
      leadTimeRealDays: enriched?.leadTimeRealDays ?? supplier.averageDeliveryDays,
      partialReceipts,
      purchasedAmount: supplierOrders.reduce((total, order) => total + order.total, 0),
      rating: supplier.rating,
      recommendation: enriched?.recommendation ?? (delayedDeliveries > 1 ? 'Revisar' : 'Conveniente'),
      recommendationReason: enriched?.recommendationReason ?? 'Datos reales backend combinados con ranking operacional temporal.',
      rut: supplier.rut,
      skuCount: enriched?.skuCount ?? supplier.categories.length,
      status: supplier.status,
      supplierId: supplier.id,
      supplierName: supplier.name,
    }
  })
}

function getStockHealth(stockItems: WarehouseStockItem[] | undefined, parts: Part[] | undefined): StockHealth[] {
  if (!stockItems?.length) {
    return stockHealthMock
  }

  return stockItems.map((item) => {
    const part = parts?.find((candidate) => candidate.id === item.partId || candidate.sku === item.sku)
    const value = Number(part?.unitCost || 0) * Number(item.quantity || 0)

    return {
      action: item.status === 'out-of-stock' ? 'Crear reposicion' : item.status === 'low-stock' ? 'Validar demanda' : 'Ver movimientos',
      blocked: 0,
      category: part?.category ?? 'Sin categoria',
      committed: 0,
      coverageDays: item.quantity <= 0 ? 0 : Math.max(7, Math.round((item.quantity / Math.max(item.minStock, 1)) * 20)),
      inTransit: 0,
      locationCode: item.locationCode,
      physical: item.quantity,
      product: item.name,
      reserved: 0,
      sku: item.sku,
      state: item.status === 'out-of-stock' ? 'Stock critico' : item.status === 'low-stock' ? 'Stock critico' : 'Disponible util',
      value,
    }
  })
}

export function getSuggestionGroupLabel(group: PurchaseSuggestion['group']) {
  const labels: Record<PurchaseSuggestion['group'], string> = {
    'active-po': 'Ya existe OC activa',
    'buy-now': 'Comprar ahora',
    'do-not-buy': 'No comprar',
    'overbuy-risk': 'Riesgo de sobrecompra',
    'review-before-buying': 'Revisar antes de comprar',
    'wait-reception': 'Esperar recepcion',
  }

  return labels[group]
}

export function getProcurementSummaryMetrics(stockHealth: StockHealth[] = stockHealthMock) {
  const sumByState = (states: StockHealth['state'][]) =>
    stockHealth.filter((item) => states.includes(item.state)).reduce((total, item) => total + item.value, 0)

  return [
    { helper: 'sano y usable', label: 'Valor stock disponible', tone: 'success' as const, value: formatCurrency(sumByState(['Disponible util', 'Reservado'])) },
    { helper: 'bloqueado por diferencia, dano o documento', label: 'Valor stock bloqueado', tone: 'danger' as const, value: formatCurrency(sumByState(['Bloqueado', 'Con diferencia'])) },
    { helper: 'sin rotacion suficiente', label: 'Valor stock lento', tone: 'warning' as const, value: formatCurrency(sumByState(['Lento movimiento'])) },
    { helper: 'sin consumo y sin demanda', label: 'Valor stock muerto', tone: 'danger' as const, value: '$2.100.000' },
    { helper: 'sobre maximo operacional', label: 'Valor sobrestock', tone: 'warning' as const, value: '$4.800.000' },
    { helper: 'bajo minimo o sin stock con demanda', label: 'Valor stock critico', tone: 'warning' as const, value: formatCurrency(sumByState(['Stock critico'])) },
  ]
}

export function getBuyerRankingRows(buyers: BuyerPerformance[] = buyerPerformanceMock) {
  return [
    {
      action: 'Analizar desempeno',
      buyer: buyers.reduce((best, current) => (current.internalRating > best.internalRating ? current : best), buyers[0]),
      label: 'Mejor comprador por cumplimiento',
      metric: 'rating interno',
    },
    {
      action: 'Reasignar pendientes',
      buyer: buyers.reduce((worst, current) => (current.overduePurchaseOrders > worst.overduePurchaseOrders ? current : worst), buyers[0]),
      label: 'Mas OC atrasadas',
      metric: 'OC vencidas',
    },
    {
      action: 'Revisar alertas',
      buyer: buyers.reduce((worst, current) => (current.overstockPurchases > worst.overstockPurchases ? current : worst), buyers[0]),
      label: 'Mas sobrestock generado',
      metric: 'compras sobre maximo',
    },
    {
      action: 'Revisar urgencias',
      buyer: buyers.reduce((worst, current) => (current.urgentPurchases > worst.urgentPurchases ? current : worst), buyers[0]),
      label: 'Mas compras urgentes',
      metric: 'compras urgentes',
    },
  ]
}

export const procurementPrimaryActions = [
  { helper: 'Quiebre proyectado, bajo minimo y demanda real', label: 'Revisar reposicion sugerida', to: `${ROUTES.warehouse}?view=suggestions` },
  { helper: 'Solicitudes detectadas por taller, operacion o stock minimo', label: 'Validar solicitudes', to: `${ROUTES.warehouse}?view=requests` },
  { helper: 'OC atrasadas, duplicadas o bloqueadas por documento', label: 'Seguir ordenes de compra', to: ROUTES.purchaseOrders },
  { helper: 'Entradas parciales, danos y documentos pendientes', label: 'Controlar recepcion', to: `${ROUTES.warehouse}?view=receipts` },
]
