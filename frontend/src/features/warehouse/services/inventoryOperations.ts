import type { Part } from '../../parts/types/part.types'
import type { PurchaseOrder } from '../../purchase-orders/types/purchaseOrder.types'
import type { Supplier } from '../../suppliers/types/supplier.types'
import type { WarehouseDemandRow } from './warehouseInsights.service'
import { getWarehouseStockInsightRows } from './warehouseInsights.service'
import type { WarehouseLocation, WarehouseMovement, WarehouseStockItem } from '../types/warehouse.types'

const openPurchaseOrderStatuses = new Set(['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'REQUESTED'])

export interface InventoryCategoryReportRow {
  category: string
  lowStock: number
  outOfStock: number
  skus: number
  stockValue: number
}

export interface InventorySupplierReportRow {
  activeOrders: number
  amount: number
  averageDeliveryDays: number
  rating: number
  supplierName: string
}

export function getInventoryCategoryReport(parts: Part[], stockItems: WarehouseStockItem[]): InventoryCategoryReportRow[] {
  const stockBySku = new Map(stockItems.map((item) => [item.sku, item]))
  const grouped = new Map<string, InventoryCategoryReportRow>()

  parts.forEach((part) => {
    const stock = stockBySku.get(part.sku)
    const quantity = stock?.quantity ?? part.stock
    const status = stock?.status || (quantity <= 0 ? 'out-of-stock' : quantity <= part.minStock ? 'low-stock' : 'available')
    const current = grouped.get(part.category) || {
      category: part.category,
      lowStock: 0,
      outOfStock: 0,
      skus: 0,
      stockValue: 0,
    }

    current.skus += 1
    current.stockValue += quantity * part.unitCost
    current.lowStock += status === 'low-stock' ? 1 : 0
    current.outOfStock += status === 'out-of-stock' ? 1 : 0
    grouped.set(part.category, current)
  })

  return [...grouped.values()].sort((first, second) => second.stockValue - first.stockValue)
}

export function getInventorySupplierReport(
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[],
): InventorySupplierReportRow[] {
  return suppliers
    .map((supplier) => {
      const orders = purchaseOrders.filter(
        (order) => order.supplierName === supplier.name && openPurchaseOrderStatuses.has(order.status),
      )

      return {
        activeOrders: orders.length,
        amount: orders.reduce((total, order) => total + order.totalEstimated, 0),
        averageDeliveryDays: supplier.averageDeliveryDays,
        rating: supplier.rating,
        supplierName: supplier.name,
      }
    })
    .sort((first, second) => second.activeOrders - first.activeOrders || second.amount - first.amount)
}

export function getInventoryReportSummary({
  demandRows,
  locations,
  movements,
  parts,
  purchaseOrders,
  stockItems,
  suppliers,
}: {
  demandRows: WarehouseDemandRow[]
  locations: WarehouseLocation[]
  movements: WarehouseMovement[]
  parts: Part[]
  purchaseOrders: PurchaseOrder[]
  stockItems: WarehouseStockItem[]
  suppliers: Supplier[]
}) {
  const stockRows = getWarehouseStockInsightRows(stockItems, { parts, purchaseOrders })
  const openOrders = purchaseOrders.filter((order) => openPurchaseOrderStatuses.has(order.status))
  const stockBySku = new Map(stockItems.map((item) => [item.sku, item]))
  const stockValue = parts.reduce((total, part) => {
    const stock = stockBySku.get(part.sku)

    return total + (stock?.quantity ?? part.stock) * part.unitCost
  }, 0)
  const pendingPurchaseAmount = openOrders.reduce((total, order) => total + order.totalEstimated, 0)

  return {
    activeSuppliers: suppliers.filter((supplier) => supplier.status === 'active').length,
    blockedCases: demandRows.filter((row) => row.purchaseRequiredParts > 0 || row.waitingReceptionParts > 0).length,
    categories: getInventoryCategoryReport(parts, stockItems),
    locationsAtRisk: locations.filter((location) => location.status === 'full' || location.status === 'maintenance').length,
    movementCount: movements.length,
    openOrders: openOrders.length,
    pendingPurchaseAmount,
    reorderSkus: stockRows.filter((row) => row.status !== 'available').length,
    skus: parts.length,
    stockValue,
    suppliers: getInventorySupplierReport(suppliers, purchaseOrders),
    totalUnits: stockItems.reduce((total, item) => total + item.quantity, 0),
  }
}
