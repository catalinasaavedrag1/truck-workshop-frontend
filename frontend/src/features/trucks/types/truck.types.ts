export type TruckStatus = 'available' | 'in-workshop' | 'blocked' | 'on-route'

export interface Truck {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  odometer: number
  status: TruckStatus
  vin: string
  lastServiceAt: string
}
