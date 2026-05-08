export type EngineStatus = 'ON' | 'OFF' | 'IDLE'

export type TelemetryAlertType =
  | 'SPEEDING'
  | 'LONG_STOP'
  | 'SIGNAL_LOST'
  | 'LOW_FUEL'
  | 'ROUTE_DEVIATION'

export interface TruckTelemetry {
  id?: string
  truckId: string
  latitude: number
  longitude: number
  speed: number
  odometer: number
  fuelLevel: number
  engineStatus: EngineStatus
  lastSignalAt: string
  idleMinutes: number
  alerts: TelemetryAlertType[]
}
