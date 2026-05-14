import type { EntityType } from '../../../shared/navigation/entityRoutes'
import type { PurchaseOrderStatus } from '../../purchase-orders/types/purchaseOrder.types'

export type ProcurementRisk = 'critical' | 'high' | 'medium' | 'low'

export type PurchaseSuggestionGroup =
  | 'buy-now'
  | 'review-before-buying'
  | 'do-not-buy'
  | 'overbuy-risk'
  | 'wait-reception'
  | 'active-po'

export type PurchaseRequestWorkflowStatus =
  | 'Detectada'
  | 'En revision'
  | 'Aprobada'
  | 'Rechazada'
  | 'Convertida en OC'
  | 'Cancelada'
  | 'Cerrada'

export type PurchaseReceiptStatus =
  | 'Esperada hoy'
  | 'Atrasada'
  | 'Recepcion parcial'
  | 'Con diferencia'
  | 'Producto danado'
  | 'Documento pendiente'
  | 'Cerrada'

export type PurchaseAuditStatus = 'Nueva' | 'En revision' | 'Justificada' | 'Corregida' | 'Rechazada' | 'Cerrada'

export type ProcurementKpi = {
  helper: string
  href?: string
  id: string
  label: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  value: string
}

export type ProcurementLink = {
  id: string
  label: string
  type: EntityType
}

export interface OperationalBlocker {
  affectedAmount: number
  blocker: string
  dueDate: string
  id: string
  impact: string
  nextAction: string
  quickAction: string
  relatedEntity?: ProcurementLink
  responsible: string
  type: 'SKU' | 'OC' | 'Proveedor' | 'Documento' | 'Stock' | 'Recepcion'
}

export interface PurchaseSuggestion {
  action: string
  activePurchaseOrderId?: string
  activePurchaseOrderNumber?: string
  cases: ProcurementLink[]
  category: string
  consumptionMonthly: number
  coverageDays: number
  group: PurchaseSuggestionGroup
  id: string
  impact: string
  justification: string
  lastPurchaseAt: string
  leadTimeDays: number
  locationCode: string
  maxStock: number
  minStock: number
  name: string
  partId: string
  recommendedSupplierId: string
  recommendedSupplierName: string
  reservedStock: number
  responsible: string
  risk: ProcurementRisk
  sku: string
  statusChips: string[]
  stockActual: number
  stockAvailable: number
  stockCommitted: number
  suggestedQuantity: number
  trucks: ProcurementLink[]
}

export interface PurchaseRequestDecision {
  action: string
  cases: ProcurementLink[]
  createdAt: string
  id: string
  justification: string
  origin: string
  purchaseOrderId?: string
  purchaseOrderNumber?: string
  requestedQuantity: number
  requestedBy: string
  responsible: string
  risk: ProcurementRisk
  sku: string
  sla: string
  state: PurchaseRequestWorkflowStatus
  suggestedQuantity: number
}

export interface ProcurementPurchaseOrder {
  alerts: string[]
  category: string
  cases: ProcurementLink[]
  createdAt: string
  documentsStatus: string
  itemsCount: number
  overdueDays: number
  promisedAt: string
  purchaseOrderId: string
  purchaseOrderNumber: string
  receptionStatus: string
  requestIds: string[]
  responsible: string
  risk: ProcurementRisk
  status: PurchaseOrderStatus
  supplierId: string
  supplierName: string
  total: number
}

export interface PurchaseReceipt {
  action: string
  documentStatus: string
  evidence: string
  expectedAt: string
  id: string
  locationCode: string
  orderedQuantity: number
  purchaseOrderId: string
  purchaseOrderNumber: string
  receivedQuantity: number
  receiver: string
  sku: string
  status: PurchaseReceiptStatus
  supplierId: string
  supplierName: string
}

export interface SupplierPerformance {
  activePurchaseOrders: number
  categories: string[]
  claimCount: number
  completeDeliveries: number
  contact: string
  lastPurchaseAt: string
  leadTimePromisedDays: number
  leadTimeRealDays: number
  partialReceipts: number
  purchasedAmount: number
  rating: number
  recommendation: 'Conveniente' | 'Revisar' | 'Evitar'
  recommendationReason: string
  rut: string
  skuCount: number
  status: string
  supplierId: string
  supplierName: string
  delayedDeliveries: number
}

export interface SupplierSkuComparison {
  averagePrice: number
  claimCount: number
  compliance: number
  lastPrice: number
  leadTimeRealDays: number
  openPurchaseOrders: number
  priceVariation: number
  rating: number
  recommendation: string
  sku: string
  supplierId: string
  supplierName: string
}

export interface BuyerPerformance {
  alerts: string[]
  assignedCategories: string[]
  buyerId: string
  buyerName: string
  duplicatePurchases: number
  internalRating: number
  openRequests: number
  overduePurchaseOrders: number
  purchaseOrdersCreated: number
  stockoutBeforePurchase: number
  overstockPurchases: number
  urgentPurchases: number
  usedSuppliers: string[]
  savingsVsHistory: number
  totalPurchased: number
  withoutDemandPurchases: number
  averageAlertToPoHours: number
}

export interface PurchaseAuditAlert {
  action: string
  alert: string
  amount: number
  dataUsed: string
  date: string
  id: string
  impact: string
  reason: string
  relatedEntity?: ProcurementLink
  responsible: string
  severity: ProcurementRisk
  status: PurchaseAuditStatus
}

export interface SkuCoverage {
  activePurchaseOrderNumber?: string
  blockedStock: number
  cases: ProcurementLink[]
  category: string
  consumptionMonthly: number
  coverageDays: number
  historicalBreaks: number
  inTransitStock: number
  lastPrice: number
  lastProvider: string
  locationCode: string
  maxStock: number
  minStock: number
  priceAverage: number
  priceHistory: string
  recommendation: string
  reservedStock: number
  rotation: string
  sku: string
  stockAvailable: number
  stockPhysical: number
  substitutes: string[]
  supplierAlternatives: string[]
  trucks: ProcurementLink[]
}

export interface StockHealth {
  action: string
  blocked: number
  category: string
  committed: number
  coverageDays: number
  inTransit: number
  locationCode: string
  physical: number
  product: string
  reserved: number
  sku: string
  state:
    | 'Disponible util'
    | 'Reservado'
    | 'Comprometido'
    | 'Bloqueado'
    | 'Sin ubicacion'
    | 'Lento movimiento'
    | 'Stock muerto'
    | 'Stock critico'
    | 'En transito'
    | 'Pendiente recepcion'
    | 'Con diferencia'
  value: number
}

export interface CategorySupplyHealth {
  buyer: string
  category: string
  criticalSkus: number
  deadSkus: number
  immobilizedStock: number
  monthlyConsumption: number
  nextAction: string
  overstockSkus: number
  pendingPurchase: number
  riskStockout: ProcurementRisk
  riskOverstock: ProcurementRisk
  suppliers: string[]
  trend: string
}

export interface DocumentControlItem {
  action: string
  amount: number
  documentState: string
  difference: string
  dueDate: string
  id: string
  purchaseOrderId: string
  purchaseOrderNumber: string
  receptionId?: string
  risk: ProcurementRisk
  supplierId: string
  supplierName: string
}

export interface ReplenishmentCalendarEvent {
  date: string
  id: string
  mode: 'Dia' | 'Semana' | 'Mes' | 'Timeline'
  provider?: string
  purchaseOrderId?: string
  purchaseOrderNumber?: string
  relatedEntity?: ProcurementLink
  responsible: string
  risk: ProcurementRisk
  title: string
  type: 'OC por llegar' | 'OC atrasada' | 'Recepcion programada' | 'Quiebre proyectado' | 'Compra sugerida' | 'Solicitud por vencer'
}
