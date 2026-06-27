import { ROUTES } from '../../../config/routes'
import { casesMock } from '../../../mocks/cases.mock'
import { partsMock } from '../../../mocks/parts.mock'
import type { Part } from '../../parts/types/part.types'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder, PurchaseOrderStatus } from '../../purchase-orders/types/purchaseOrder.types'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { warehouseStockMock } from '../mocks/warehouse.mock'
import type { StockStatus } from '../types/warehouse.types'

export interface WarehouseDemandRow {
  id: string
  caseId: string
  caseNumber: string
  customerName: string
  truckPlate: string
  priority: string
  slaStatus: string
  requestedParts: number
  availableParts: number
  purchaseRequiredParts: number
  waitingReceptionParts: number
  missingSkus: string[]
  actionLabel: string
}

export interface WarehouseStockInsightRow {
  partId: string
  sku: string
  name: string
  category: string
  quantity: number
  minStock: number
  locationCode: string
  status: StockStatus
  activeCases: number
  requiredQuantity: number
  pendingPurchaseOrder?: string
  pendingPurchaseOrderStatus?: PurchaseOrderStatus
  nextAction: string
  stockValue: number
}

export interface PartInventoryRow {
  partId: string
  sku: string
  name: string
  category: string
  quantity: number
  minStock: number
  locationCode: string
  unitCost: number
  status: StockStatus
  activeCases: number
  pendingPurchaseOrder?: string
  reorderSuggestion: number
  stockValue: number
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  deletedBy?: string
}

const STOCK_LABELS: Record<StockStatus, string> = {
  available: 'Disponible',
  'low-stock': 'Bajo stock',
  'out-of-stock': 'Sin stock',
}

const STOCK_TONES: Record<StockStatus, BadgeTone> = {
  available: 'success',
  'low-stock': 'warning',
  'out-of-stock': 'danger',
}

export function getStockLabel(status: StockStatus) {
  return STOCK_LABELS[status]
}

export function getStockTone(status: StockStatus) {
  return STOCK_TONES[status]
}

function getCalculatedStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= 0) {
    return 'out-of-stock'
  }

  if (quantity <= minStock) {
    return 'low-stock'
  }

  return 'available'
}

interface WarehouseInsightContext {
  parts?: Part[]
  purchaseOrders?: PurchaseOrder[]
  workshopCases?: WorkshopCase[]
}

function findActivePurchaseOrder(sku: string, purchaseOrders = purchaseOrdersMock) {
  return purchaseOrders.find(
    (order) =>
      !['RECEIVED', 'CANCELLED'].includes(order.status) && order.items.some((item) => item.sku === sku),
  )
}

function countCasesForSku(sku: string, workshopCases = casesMock) {
  return workshopCases.filter((workshopCase) => workshopCase.requiredParts.some((part) => part.sku === sku)).length
}

function requiredQuantityForSku(sku: string, workshopCases = casesMock) {
  return workshopCases.reduce(
    (total, workshopCase) =>
      total + workshopCase.requiredParts
        .filter((part) => part.sku === sku)
        .reduce((partTotal, part) => partTotal + part.quantity, 0),
    0,
  )
}

export function getWarehouseDemandRows(workshopCases = casesMock): WarehouseDemandRow[] {
  return workshopCases
    .filter((workshopCase) => workshopCase.requiredParts.length > 0)
    .map((workshopCase) => {
      const availableParts = workshopCase.requiredParts.filter((part) => part.status === 'available').length
      const purchaseRequiredParts = workshopCase.requiredParts.filter((part) => part.requiresPurchase).length
      const waitingReceptionParts = workshopCase.requiredParts.filter((part) => part.status === 'waiting_reception').length
      const missingSkus = workshopCase.requiredParts
        .filter((part) => part.requiresPurchase || part.stockAvailable < part.quantity)
        .map((part) => part.sku)

      return {
        actionLabel:
          purchaseRequiredParts > 0
            ? waitingReceptionParts > 0
              ? 'Esperar recepcion'
              : 'Generar/seguir OC'
            : 'Reservar y entregar',
        availableParts,
        caseId: workshopCase.id,
        caseNumber: workshopCase.caseNumber,
        customerName: workshopCase.customerName,
        id: workshopCase.id,
        missingSkus,
        priority: workshopCase.priority,
        purchaseRequiredParts,
        requestedParts: workshopCase.requiredParts.length,
        slaStatus: workshopCase.slaStatus,
        truckPlate: workshopCase.truckPlate,
        waitingReceptionParts,
      }
    })
}

export function getWarehouseStockInsightRows(
  stockItems = warehouseStockMock,
  context: WarehouseInsightContext = {},
): WarehouseStockInsightRow[] {
  const parts = context.parts ?? partsMock
  const purchaseOrders = context.purchaseOrders ?? purchaseOrdersMock
  const workshopCases = context.workshopCases ?? casesMock

  return stockItems.map((stockItem) => {
    const part = parts.find((item) => item.sku === stockItem.sku)
    const activePo = findActivePurchaseOrder(stockItem.sku, purchaseOrders)
    const activeCases = countCasesForSku(stockItem.sku, workshopCases)
    const requiredQuantity = requiredQuantityForSku(stockItem.sku, workshopCases)
    const stockValue = stockItem.quantity * (part?.unitCost || 0)

    return {
      activeCases,
      category: part?.category || 'Sin categoria',
      locationCode: stockItem.locationCode,
      minStock: stockItem.minStock,
      name: stockItem.name,
      nextAction:
        stockItem.status === 'out-of-stock'
          ? activePo
            ? 'Esperar recepcion de OC'
            : 'Crear orden de compra'
          : stockItem.status === 'low-stock'
            ? 'Reponer stock minimo'
            : activeCases > 0
              ? 'Reservar para caso'
              : 'Disponible',
      partId: stockItem.partId,
      pendingPurchaseOrder: activePo?.purchaseOrderNumber,
      pendingPurchaseOrderStatus: activePo?.status,
      quantity: stockItem.quantity,
      requiredQuantity,
      sku: stockItem.sku,
      status: stockItem.status,
      stockValue,
    }
  })
}

export function getPartInventoryRows(parts: Part[] = partsMock): PartInventoryRow[] {
  return parts.map((part) => {
    const warehouseStock = warehouseStockMock.find((item) => item.sku === part.sku)
    const quantity = warehouseStock?.quantity ?? part.stock
    const minStock = warehouseStock?.minStock ?? part.minStock
    const status = warehouseStock?.status ?? getCalculatedStatus(quantity, minStock)
    const activePo = findActivePurchaseOrder(part.sku)
    const activeCases = countCasesForSku(part.sku)

    return {
      activeCases,
      category: part.category,
      locationCode: warehouseStock?.locationCode || 'Sin ubicacion',
      minStock,
      name: part.name,
      partId: part.id,
      pendingPurchaseOrder: activePo?.purchaseOrderNumber,
      quantity,
      reorderSuggestion: Math.max(minStock * 2 - quantity, 0),
      sku: part.sku,
      status,
      stockValue: quantity * part.unitCost,
      unitCost: part.unitCost,
      createdAt: part.createdAt,
      createdBy: part.createdBy,
      updatedAt: part.updatedAt,
      updatedBy: part.updatedBy,
      deletedBy: part.deletedBy,
    }
  })
}

export function getPartDetailContext(partId: string) {
  const part = partsMock.find((item) => item.id === partId)

  if (!part) {
    return null
  }

  const row = getPartInventoryRows().find((item) => item.partId === partId)
  const stock = warehouseStockMock.find((item) => item.sku === part.sku)
  const cases = casesMock.filter((workshopCase) => workshopCase.requiredParts.some((requiredPart) => requiredPart.sku === part.sku))
  const purchaseOrders = purchaseOrdersMock.filter((order) => order.items.some((item) => item.sku === part.sku))

  return {
    cases: cases.map((workshopCase) => ({
      caseId: workshopCase.id,
      caseNumber: workshopCase.caseNumber,
      customerName: workshopCase.customerName,
      driverId: workshopCase.driverId,
      driverName: workshopCase.driverName,
      path: ROUTES.caseDetail(workshopCase.id),
      priority: workshopCase.priority,
      status: workshopCase.status,
      truckId: workshopCase.truckId,
      truckPlate: workshopCase.truckPlate,
    })),
    part,
    purchaseOrders,
    row,
    stock,
  }
}
