import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { TruckCostType } from '../types/truckCosts.types'

export const truckCostTypeLabels: Record<TruckCostType, string> = {
  DRIVER: 'Chofer / viatico',
  FUEL: 'Combustible',
  FREIGHT_OPERATION: 'Operacion flete',
  MAINTENANCE: 'Mantencion',
  PARTS: 'Repuestos',
  TIRES: 'Neumaticos',
  LABOR: 'Mano de obra',
  INSURANCE: 'Seguros',
  PERMIT: 'Permisos',
  FINE: 'Multas',
  TOLL: 'Peajes',
  REPAIR: 'Reparaciones',
  PURCHASE: 'Compra',
  OTHER: 'Otro',
}

export const truckProfitabilityLabels = {
  EXPENSIVE: 'Alto costo',
  PROFITABLE: 'Rentable',
  WATCH: 'Observar',
} as const

export const truckProfitabilityTones: Record<keyof typeof truckProfitabilityLabels, BadgeTone> = {
  EXPENSIVE: 'danger',
  PROFITABLE: 'success',
  WATCH: 'warning',
}
