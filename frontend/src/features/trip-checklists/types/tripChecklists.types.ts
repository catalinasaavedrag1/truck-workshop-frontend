export type ChecklistStatus = 'DRAFT' | 'COMPLETED' | 'WITH_OBSERVATIONS' | 'BLOCKED'

export interface TripDepartureChecklist {
  id: string
  freightId: string
  truckId: string
  driverId: string
  departureAt: string
  odometerStart: number
  fuelLevelStart: number
  tiresOk: boolean
  lightsOk: boolean
  brakesOk: boolean
  oilOk: boolean
  waterOk: boolean
  documentsOk: boolean
  cargoSecured: boolean
  photos: string[]
  observations?: string
  status: ChecklistStatus
}

export interface TripArrivalChecklist {
  id: string
  freightId: string
  truckId: string
  driverId: string
  arrivalAt: string
  odometerEnd: number
  fuelLevelEnd: number
  newDamages: boolean
  cargoStatus: string
  receiverName: string
  receiverSignatureUrl?: string
  photos: string[]
  observations?: string
  status: ChecklistStatus
}
