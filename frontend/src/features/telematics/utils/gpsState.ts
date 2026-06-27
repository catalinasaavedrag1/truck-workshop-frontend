import type { GpsPosition } from '../services/gpsTracking.service'

export type GpsMovementState = 'moving' | 'engine' | 'stopped'

// Colores por estado operacional, compartidos por el mapa, la leyenda y las
// metricas para que todo lea igual.
export const GPS_STATE_COLOR: Record<GpsMovementState, string> = {
  moving: '#16a34a',
  engine: '#d97706',
  stopped: '#64748b',
}

export function gpsMovementState(position: GpsPosition): GpsMovementState {
  if (position.speed > 0) {
    return 'moving'
  }
  if (position.engineOn) {
    return 'engine'
  }
  return 'stopped'
}
