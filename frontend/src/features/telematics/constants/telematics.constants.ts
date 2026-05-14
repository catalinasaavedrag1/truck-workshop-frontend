import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { TelemetryAlertType } from '../types/telematics.types'

export const telemetryAlertLabels: Record<TelemetryAlertType, string> = {
  SPEEDING: 'Exceso velocidad',
  LONG_STOP: 'Detencion larga',
  SIGNAL_LOST: 'Senal perdida',
  LOW_FUEL: 'Bajo combustible',
  ROUTE_DEVIATION: 'Desvio ruta',
}

export const telemetryAlertTones: Record<TelemetryAlertType, BadgeTone> = {
  SPEEDING: 'danger',
  LONG_STOP: 'warning',
  SIGNAL_LOST: 'danger',
  LOW_FUEL: 'warning',
  ROUTE_DEVIATION: 'warning',
}
