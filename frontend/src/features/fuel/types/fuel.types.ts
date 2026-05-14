export type FuelDeviationStatus = 'NORMAL' | 'WARNING' | 'SUSPICIOUS'

export interface FuelRecord {
  id: string
  truckId: string
  driverId: string
  date: string
  liters: number
  pricePerLiter: number
  totalAmount: number
  odometer: number
  stationName: string
  receiptNumber?: string
  attachmentUrl?: string
  kmPerLiter?: number
  deviationStatus: FuelDeviationStatus
  notes?: string
}

export interface FuelPriceSnapshot {
  errorMessage?: string
  fuelType: string
  id: string
  isOfficial: boolean
  isStale: boolean
  lastFetchedAt: string | null
  minutesUntilNextSync: number
  month?: number | null
  nextSyncAt?: string | null
  normalizedFuelType: string
  pricePerLiter: number
  provider: string
  regionCode: string
  regionName: string
  source: string
  sourceDate: string | null
  status: 'OK' | 'FALLBACK' | string
  syncIntervalMinutes: number
  year?: number | null
}
