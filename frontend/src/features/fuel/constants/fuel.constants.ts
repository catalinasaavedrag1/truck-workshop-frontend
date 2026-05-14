import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FuelDeviationStatus } from '../types/fuel.types'

export const fuelDeviationLabels: Record<FuelDeviationStatus, string> = {
  NORMAL: 'Normal',
  WARNING: 'Desviacion controlada',
  SUSPICIOUS: 'Investigar',
}

export const fuelDeviationTones: Record<FuelDeviationStatus, BadgeTone> = {
  NORMAL: 'success',
  WARNING: 'warning',
  SUSPICIOUS: 'danger',
}

export const fuelDeviationDescriptions: Record<FuelDeviationStatus, string> = {
  NORMAL: 'Rendimiento dentro del rango esperado.',
  WARNING: 'Consumo bajo o fuera de rango operativo.',
  SUSPICIOUS: 'Caida fuerte; requiere revision de respaldo.',
}

export const fuelDeviationOptions = [
  { label: 'Todas', value: 'all' },
  { label: fuelDeviationLabels.NORMAL, value: 'NORMAL' },
  { label: fuelDeviationLabels.WARNING, value: 'WARNING' },
  { label: fuelDeviationLabels.SUSPICIOUS, value: 'SUSPICIOUS' },
]
