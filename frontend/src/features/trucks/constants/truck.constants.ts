import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { TruckStatus } from '../types/truck.types'

export const truckStatusLabels: Record<TruckStatus, string> = {
  available: 'Disponible',
  blocked: 'Bloqueado',
  'in-workshop': 'En taller',
  'on-route': 'En ruta',
}

export const truckStatusTones: Record<TruckStatus, BadgeTone> = {
  available: 'success',
  blocked: 'danger',
  'in-workshop': 'warning',
  'on-route': 'info',
}
