export type OperationalTruckStatus =
  | 'AVAILABLE'
  | 'ASSIGNED_TO_FREIGHT'
  | 'ON_ROUTE'
  | 'IN_WORKSHOP'
  | 'WAITING_PARTS'
  | 'BLOCKED'
  | 'OUT_OF_SERVICE'
  | 'SOLD'

export type FuelType = 'DIESEL' | 'ELECTRIC' | 'HYBRID'

export type OwnerType = 'OWNED' | 'LEASED' | 'RENTED'

export type TruckHealthStatus = 'HEALTHY' | 'WARNING' | 'RISK' | 'CRITICAL'

export type TruckHealthActionState = 'DISPATCH_READY' | 'REVIEW_BEFORE_ASSIGNMENT' | 'BLOCKED'

export type TruckHealthRiskCategory =
  | 'COSTS'
  | 'DOCUMENTS'
  | 'FUEL'
  | 'INCIDENTS'
  | 'MAINTENANCE'
  | 'NONE'
  | 'OPERATIONAL'
  | 'TELEMETRY'

export type FleetAvailabilityColumn =
  | 'AVAILABLE'
  | 'ON_ROUTE'
  | 'IN_WORKSHOP'
  | 'WAITING_PARTS'
  | 'NO_DRIVER'
  | 'EXPIRED_DOCUMENTS'
  | 'MAINTENANCE_BLOCKED'
  | 'OUT_OF_SERVICE'

export type TruckTimelineEventType =
  | 'PURCHASE'
  | 'PREVENTIVE_MAINTENANCE'
  | 'BREAKDOWN'
  | 'REPAIR'
  | 'TIRE_CHANGE'
  | 'FREIGHT_DONE'
  | 'DRIVER_ASSIGNED'
  | 'ACCIDENT'
  | 'FINE'
  | 'COST'
  | 'DOCUMENT'
  | 'STATUS_CHANGE'
  | 'DEPARTURE_CHECKLIST'
  | 'ARRIVAL_CHECKLIST'

export interface FleetTruck {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  vin: string
  chassisNumber: string
  engineNumber: string
  loadCapacityKg: number
  bodyType: string
  currentOdometer: number
  operationalStatus: OperationalTruckStatus
  fuelType: FuelType
  acquisitionDate: string
  acquisitionCost: number
  ownerType: OwnerType
  assignedDriverId?: string
  assignedDriverName?: string
  nextFreightId?: string
  nextFreightAt?: string
  estimatedAvailableAt?: string
  mainBlocker?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FleetAvailabilityItem {
  id: string
  truckId: string
  column: FleetAvailabilityColumn
  blockerReason?: string
  availableAt?: string
}

export interface TruckTimelineEvent {
  id: string
  truckId: string
  eventType: TruckTimelineEventType
  title: string
  description: string
  relatedEntityType?: string
  relatedEntityId?: string
  eventDate: string
  createdBy: string
}

export interface TruckHealthScore {
  id?: string
  truckId: string
  score: number
  status: TruckHealthStatus
  deductions: {
    action?: string
    category?: TruckHealthRiskCategory
    label: string
    points: number
    relatedEntityId?: string
    relatedEntityType?: string
    severity?: 'CRITICAL' | 'INFO' | 'RISK' | 'WARNING'
  }[]
  summary: string
  createdAt?: string
  updatedAt?: string
}

export interface FleetHealthScoreRow extends TruckHealthScore {
  actionState: TruckHealthActionState
  assignedDriverName?: string
  brand?: string
  costPerKm: number
  mainBlocker?: string
  model?: string
  monthlyCost: number
  nextAction: string
  operationalStatus: OperationalTruckStatus
  plate: string
  previousScore?: number
  scoreDelta: number
  statusLabel: string
  topRiskCategory: TruckHealthRiskCategory
  truckLabel: string
}

export interface FleetHealthScoreOverview {
  generatedAt: string
  persisted?: boolean
  rows: FleetHealthScoreRow[]
  rules: Record<TruckHealthStatus, string>
  summary: {
    averageScore: number
    blocked: number
    critical: number
    dispatchReady: number
    healthy: number
    reviewRequired: number
    risk: number
    total: number
    warning: number
    worstTruck?: {
      plate: string
      score: number
      truckId: string
    }
  }
}

export interface FleetMetric {
  label: string
  value: string
  helper: string
}
