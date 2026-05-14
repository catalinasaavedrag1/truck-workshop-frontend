export type FreightRequestStatus =
  | 'NEW'
  | 'QUOTING'
  | 'QUOTE_SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'

export type CargoType =
  | 'GENERAL'
  | 'PALLETIZED'
  | 'BULK'
  | 'FRAGILE'
  | 'REFRIGERATED'
  | 'HAZARDOUS'
  | 'OVERSIZED'

export type QuoteDeliveryChannel = 'WHATSAPP' | 'EMAIL'

export type FreightQuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

export type FreightAssignmentStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'

export interface FreightRequest {
  id: string
  requestNumber: string
  trackingNumber?: string
  customerId?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  originAddress: string
  destinationAddress: string
  estimatedKm: number
  cargoType: CargoType
  cargoDescription: string
  weightKg?: number
  volumeM3?: number
  requiresWaitingTime: boolean
  waitingHours?: number
  requiresLoadingHelp: boolean
  requiresUnloadingHelp: boolean
  requestedPickupDate?: string
  pickupWindow?: string
  packageCount?: number
  coverageZone?: string
  availabilityStatus?: string
  estimatedDurationText?: string
  observations?: string
  status: FreightRequestStatus
  quoteId?: string
  assignedTruckId?: string
  assignedDriverId?: string
  createdAt: string
  updatedAt: string
}

export interface FreightQuote {
  id: string
  quoteNumber: string
  requestId: string
  customerId?: string
  customerName: string
  estimatedKm: number
  cargoType: CargoType
  baseRate: number
  kmRate: number
  waitingCost: number
  loadingCost: number
  unloadingCost: number
  cargoTypeSurcharge: number
  dieselPricePerLiter?: number
  fuelCost?: number
  fuelKmPerLiter?: number
  fuelLiters?: number
  marginAmount?: number
  operationCost?: number
  operationCostPerKm?: number
  pricingConfigId?: string
  pricingSnapshot?: FreightPricingSettings
  routePricingSnapshot?: FreightRoutePricingSnapshot
  subtotal: number
  taxAmount: number
  tollCost?: number
  total: number
  validUntil: string
  status: FreightQuoteStatus
  sentBy?: QuoteDeliveryChannel
  sentAt?: string
  approvedAt?: string
  rejectedAt?: string
}

export interface FreightAssignment {
  id: string
  requestId: string
  quoteId: string
  truckId: string
  driverId: string
  assignedBy: string
  pickupDate: string
  deliveryDate?: string
  status: FreightAssignmentStatus
  notes?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}

export interface FreightQuoteCalculationInput {
  estimatedKm: number
  cargoType: CargoType
  waitingHours?: number
  requiresLoadingHelp: boolean
  requiresUnloadingHelp: boolean
}

export interface FreightQuoteLineItem {
  id: string
  label: string
  quantity: number
  unitAmount: number
  total: number
}

export interface FreightPricingSettings {
  active: boolean
  baseRate: number
  cargoSurcharges: Record<CargoType, number>
  createdAt?: string
  createdBy?: string
  currencyCode: string
  dieselPricePerLiter: number
  fallbackDieselPricePerLiter?: number
  fuelPriceSource?: FreightFuelPriceSource
  fuelKmPerLiter: number
  id: string
  loadingHelpCost: number
  marginPercent: number
  name: string
  operationCostPerKm: number
  taxPercent: number
  tollMarkupPercent: number
  unloadingHelpCost: number
  updatedAt?: string
  updatedBy?: string
  waitingHourRate: number
}

export interface FreightRoutePricingSnapshot {
  distanceKm?: number
  durationText?: string
  tolls?: {
    currencyCode: string
    hasTolls: boolean
    priceKnown: boolean
    totalAmount: number
  }
}

export interface FreightPricingCalculation {
  baseRate: number
  cargoType: CargoType
  cargoTypeSurcharge: number
  currencyCode: string
  dieselPricePerLiter: number
  distanceCost: number
  estimatedKm: number
  fuelCost: number
  fuelKmPerLiter: number
  fuelLiters: number
  fuelPriceSource?: FreightFuelPriceSource
  kmRate: number
  lineItems: FreightQuoteLineItem[]
  loadingCost: number
  marginAmount: number
  operationCost: number
  operationCostPerKm: number
  pricingConfigId: string
  pricingSnapshot: FreightPricingSettings
  route?: FreightRoutePricingSnapshot
  routePricingSnapshot?: FreightRoutePricingSnapshot
  subtotal: number
  taxAmount: number
  tollCharge: number
  tollCost: number
  tolls?: FreightRoutePricingSnapshot['tolls']
  total: number
  unloadingCost: number
  waitingCost: number
}

export interface FreightFuelPriceSource {
  errorMessage?: string
  fuelType: string
  id: string
  isOfficial: boolean
  isStale: boolean
  lastFetchedAt: string | null
  minutesUntilNextSync: number
  normalizedFuelType: string
  pricePerLiter: number
  provider: string
  regionCode: string
  regionName: string
  source: string
  sourceDate: string | null
  status: string
  syncIntervalMinutes: number
}
