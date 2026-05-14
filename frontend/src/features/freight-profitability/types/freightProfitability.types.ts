export interface FreightProfitability {
  id: string
  freightId: string
  truckId: string
  driverId: string
  customerName: string
  revenue: number
  fuelCost: number
  tollCost: number
  driverCost: number
  tireWearCost: number
  maintenanceAllocatedCost: number
  otherCosts: number
  totalCost: number
  grossMargin: number
  netMargin: number
  marginPercentage: number
  km: number
  costPerKm: number
  revenuePerKm: number
}
