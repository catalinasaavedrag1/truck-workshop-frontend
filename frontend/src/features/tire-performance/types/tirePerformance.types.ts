export type TireType = 'NEW' | 'RETREADED'

export type TireUsageType = 'STEERING' | 'TRACTION' | 'TRAILER' | 'SPARE'

export type TireLifecycleStatus =
  | 'PURCHASED'
  | 'IN_STOCK'
  | 'INSTALLED'
  | 'REMOVED'
  | 'RETREADED'
  | 'DISCARDED'
  | 'WARRANTY_CLAIM'

export type TireRemovalReason =
  | 'NORMAL_WEAR'
  | 'PUNCTURE'
  | 'FAILURE'
  | 'RETREAD'
  | 'WARRANTY'
  | 'PREVENTIVE_CHANGE'
  | 'OPERATIONAL_DAMAGE'
  | 'UNKNOWN'

export type TirePosition =
  | 'FRONT_LEFT'
  | 'FRONT_RIGHT'
  | 'DRIVE_LEFT'
  | 'DRIVE_RIGHT'
  | 'DRIVE_INNER_LEFT'
  | 'DRIVE_INNER_RIGHT'
  | 'TRAILER_LEFT'
  | 'TRAILER_RIGHT'
  | 'SPARE'

export interface TireLifecycle {
  id: string
  skuId: string
  skuCode: string
  skuName: string
  purchaseOrderId?: string
  supplierId?: string
  supplierName: string
  truckId?: string
  truckPlate?: string
  brand: string
  model?: string
  tireSize?: string
  tireType: TireType
  usageType: TireUsageType
  tirePosition?: TirePosition
  purchaseCost: number
  purchaseDate: string
  installedAt?: string
  odometerAtInstall?: number
  removedAt?: string
  odometerAtRemoval?: number
  kmUsed?: number
  costPerKm?: number
  removalReason?: TireRemovalReason
  status: TireLifecycleStatus
  caseId?: string
  notes?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
  createdAt: string
  updatedAt: string
}

export interface TirePerformanceFilters {
  tireType: TireType | 'all'
  supplierName: string
  brand: string
  truckId: string
  tirePosition: TirePosition | 'all'
  usageType: TireUsageType | 'all'
  status: TireLifecycleStatus | 'all'
  removalReason: TireRemovalReason | 'all'
  fromDate: string
  toDate: string
}

export interface TireStockIntakePayload {
  brand: string
  caseId?: string
  model?: string
  notes?: string
  purchaseCost: number
  purchaseDate: string
  purchaseOrderId?: string
  quantity: number
  skuCode?: string
  skuId: string
  skuName?: string
  status?: Extract<TireLifecycleStatus, 'PURCHASED' | 'IN_STOCK'>
  supplierId?: string
  supplierName: string
  tireSize?: string
  tireType: TireType
  usageType: TireUsageType
}

export interface TireInstallPayload {
  installedAt: string
  notes?: string
  odometerAtInstall: number
  tirePosition: TirePosition
  truckId: string
  usageType: TireUsageType
}

export interface TireRemovePayload {
  notes?: string
  odometerAtRemoval: number
  removalReason: TireRemovalReason
  removedAt: string
}
