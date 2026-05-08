export type WarehouseLocationStatus = 'active' | 'maintenance' | 'full' | 'inactive'

export interface WarehouseLocation {
  id: string
  code: string
  name: string
  zone: string
  aisle: string
  shelf: string
  level: string
  capacity: number
  status: WarehouseLocationStatus
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export type StockStatus = 'available' | 'low-stock' | 'out-of-stock'

export interface WarehouseStockItem {
  partId: string
  sku: string
  name: string
  quantity: number
  locationId: string
  locationCode: string
  minStock: number
  status: StockStatus
}

export interface WarehouseManager {
  id: string
  name: string
  phone: string
  shift: string
  activeCases: number
  assignedLocationIds: string[]
}

export interface WarehouseMovement {
  id: string
  partSku: string
  partName: string
  type: 'entrada' | 'salida' | 'ajuste'
  quantity: number
  locationCode: string
  relatedCaseId?: string
  createdAt: string
  createdBy: string
}
