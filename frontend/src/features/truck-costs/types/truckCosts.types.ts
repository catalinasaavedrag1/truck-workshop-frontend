export type TruckCostType =
  | 'DRIVER'
  | 'FUEL'
  | 'FREIGHT_OPERATION'
  | 'MAINTENANCE'
  | 'PARTS'
  | 'TIRES'
  | 'LABOR'
  | 'INSURANCE'
  | 'PERMIT'
  | 'FINE'
  | 'TOLL'
  | 'REPAIR'
  | 'PURCHASE'
  | 'OTHER'

export interface TruckCost {
  id: string
  truckId: string
  costType: TruckCostType
  description: string
  amount: number
  date: string
  relatedEntityType?: string
  relatedEntityId?: string
  odometer?: number
  notes?: string
  sourceModule?: string
  sourcePriority?: number
}

export interface TruckCostSummary {
  truckId: string
  monthlyCost: number
  costPerKm: number
  freightCostAverage: number
  workshopCost: number
  profitabilityStatus: 'PROFITABLE' | 'WATCH' | 'EXPENSIVE'
}

export type TruckCostPeriodMode = 'monthly' | 'annual'

export interface TruckCostCategorySummary {
  amount: number
  label: string
  percent: number
  type: TruckCostType | string
}

export interface TruckCostTruckAnalytics {
  annualCost: number
  categories: TruckCostCategorySummary[]
  costPerKm: number
  freightCount: number
  km: number
  lastCostAt?: string
  monthlyCost: number
  netMargin: number
  operationalStatus?: string
  plate: string
  profitabilityStatus: TruckCostSummary['profitabilityStatus']
  revenue: number
  topCategory?: {
    amount: number
    label: string
    type: string
  }
  totalCost: number
  truckId: string
  truckLabel: string
}

export interface TruckCostAnalytics {
  categories: TruckCostCategorySummary[]
  costs: TruckCost[]
  fleet: {
    annualProjected: number
    costPerKm: number
    expensiveTrucks: number
    monthlyEquivalent: number
    netMargin: number
    revenue: number
    totalCost: number
    totalKm: number
    trucksCount: number
  }
  period: {
    endDate: string
    label: string
    mode: TruckCostPeriodMode
    month?: number
    startDate: string
    year: number
  }
  trucks: TruckCostTruckAnalytics[]
}
