import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type {
  TireLifecycle,
  TireLifecycleStatus,
  TirePosition,
  TireRemovalReason,
  TireType,
  TireUsageType,
} from '../types/tirePerformance.types'

export const TIRE_TYPE_LABELS: Record<TireType, string> = {
  NEW: 'Nuevo',
  RETREADED: 'Recauchado',
}

export const TIRE_USAGE_LABELS: Record<TireUsageType, string> = {
  SPARE: 'Repuesto',
  STEERING: 'Direccion',
  TRACTION: 'Traccion',
  TRAILER: 'Arrastre',
}

export const TIRE_STATUS_LABELS: Record<TireLifecycleStatus, string> = {
  DISCARDED: 'Descartado',
  INSTALLED: 'Instalado',
  IN_STOCK: 'En stock',
  PURCHASED: 'Comprado',
  REMOVED: 'Retirado',
  RETREADED: 'A recauche',
  WARRANTY_CLAIM: 'Garantia',
}

export const TIRE_STATUS_TONES: Record<TireLifecycleStatus, BadgeTone> = {
  DISCARDED: 'danger',
  INSTALLED: 'info',
  IN_STOCK: 'success',
  PURCHASED: 'neutral',
  REMOVED: 'warning',
  RETREADED: 'info',
  WARRANTY_CLAIM: 'warning',
}

export const TIRE_POSITION_LABELS: Record<TirePosition, string> = {
  DRIVE_INNER_LEFT: 'Traccion interior izq.',
  DRIVE_INNER_RIGHT: 'Traccion interior der.',
  DRIVE_LEFT: 'Traccion izq.',
  DRIVE_RIGHT: 'Traccion der.',
  FRONT_LEFT: 'Delantero izq.',
  FRONT_RIGHT: 'Delantero der.',
  SPARE: 'Repuesto',
  TRAILER_LEFT: 'Arrastre izq.',
  TRAILER_RIGHT: 'Arrastre der.',
}

export const TIRE_REMOVAL_REASON_LABELS: Record<TireRemovalReason, string> = {
  FAILURE: 'Falla',
  NORMAL_WEAR: 'Desgaste normal',
  OPERATIONAL_DAMAGE: 'Dano operacional',
  PREVENTIVE_CHANGE: 'Cambio preventivo',
  PUNCTURE: 'Pinchazo',
  RETREAD: 'Recauche',
  UNKNOWN: 'Desconocido',
  WARRANTY: 'Garantia',
}

export const TIRE_TYPE_OPTIONS: Array<{ label: string; value: TireType | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: TIRE_TYPE_LABELS.NEW, value: 'NEW' },
  { label: TIRE_TYPE_LABELS.RETREADED, value: 'RETREADED' },
]

export const TIRE_USAGE_OPTIONS: Array<{ label: string; value: TireUsageType | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: TIRE_USAGE_LABELS.STEERING, value: 'STEERING' },
  { label: TIRE_USAGE_LABELS.TRACTION, value: 'TRACTION' },
  { label: TIRE_USAGE_LABELS.TRAILER, value: 'TRAILER' },
  { label: TIRE_USAGE_LABELS.SPARE, value: 'SPARE' },
]

export const TIRE_POSITION_OPTIONS: Array<{ label: string; value: TirePosition | 'all' }> = [
  { label: 'Todas', value: 'all' },
  { label: TIRE_POSITION_LABELS.FRONT_LEFT, value: 'FRONT_LEFT' },
  { label: TIRE_POSITION_LABELS.FRONT_RIGHT, value: 'FRONT_RIGHT' },
  { label: TIRE_POSITION_LABELS.DRIVE_LEFT, value: 'DRIVE_LEFT' },
  { label: TIRE_POSITION_LABELS.DRIVE_RIGHT, value: 'DRIVE_RIGHT' },
  { label: TIRE_POSITION_LABELS.DRIVE_INNER_LEFT, value: 'DRIVE_INNER_LEFT' },
  { label: TIRE_POSITION_LABELS.DRIVE_INNER_RIGHT, value: 'DRIVE_INNER_RIGHT' },
  { label: TIRE_POSITION_LABELS.TRAILER_LEFT, value: 'TRAILER_LEFT' },
  { label: TIRE_POSITION_LABELS.TRAILER_RIGHT, value: 'TRAILER_RIGHT' },
  { label: TIRE_POSITION_LABELS.SPARE, value: 'SPARE' },
]

export const TIRE_STATUS_OPTIONS: Array<{ label: string; value: TireLifecycleStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: TIRE_STATUS_LABELS.PURCHASED, value: 'PURCHASED' },
  { label: TIRE_STATUS_LABELS.IN_STOCK, value: 'IN_STOCK' },
  { label: TIRE_STATUS_LABELS.INSTALLED, value: 'INSTALLED' },
  { label: TIRE_STATUS_LABELS.REMOVED, value: 'REMOVED' },
  { label: TIRE_STATUS_LABELS.RETREADED, value: 'RETREADED' },
  { label: TIRE_STATUS_LABELS.DISCARDED, value: 'DISCARDED' },
  { label: TIRE_STATUS_LABELS.WARRANTY_CLAIM, value: 'WARRANTY_CLAIM' },
]

export const TIRE_REMOVAL_REASON_OPTIONS: Array<{ label: string; value: TireRemovalReason | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: TIRE_REMOVAL_REASON_LABELS.NORMAL_WEAR, value: 'NORMAL_WEAR' },
  { label: TIRE_REMOVAL_REASON_LABELS.PUNCTURE, value: 'PUNCTURE' },
  { label: TIRE_REMOVAL_REASON_LABELS.FAILURE, value: 'FAILURE' },
  { label: TIRE_REMOVAL_REASON_LABELS.RETREAD, value: 'RETREAD' },
  { label: TIRE_REMOVAL_REASON_LABELS.WARRANTY, value: 'WARRANTY' },
  { label: TIRE_REMOVAL_REASON_LABELS.PREVENTIVE_CHANGE, value: 'PREVENTIVE_CHANGE' },
  { label: TIRE_REMOVAL_REASON_LABELS.OPERATIONAL_DAMAGE, value: 'OPERATIONAL_DAMAGE' },
  { label: TIRE_REMOVAL_REASON_LABELS.UNKNOWN, value: 'UNKNOWN' },
]

export function calculateKmUsed(tire: Pick<TireLifecycle, 'odometerAtInstall' | 'odometerAtRemoval'>) {
  if (tire.odometerAtInstall === undefined || tire.odometerAtRemoval === undefined) {
    return undefined
  }

  return tire.odometerAtRemoval - tire.odometerAtInstall
}

export function calculateCostPerKm(purchaseCost: number, kmUsed: number | undefined) {
  if (!kmUsed || kmUsed <= 0) {
    return undefined
  }

  return purchaseCost / kmUsed
}

export function getTireResult(tire: TireLifecycle) {
  const kmUsed = tire.kmUsed ?? calculateKmUsed(tire)
  const costPerKm = tire.costPerKm ?? calculateCostPerKm(tire.purchaseCost, kmUsed)

  if (tire.status === 'INSTALLED' || tire.odometerAtRemoval === undefined) {
    return 'En uso'
  }

  if (!kmUsed || kmUsed <= 0 || !costPerKm) {
    return 'Advertencia'
  }

  if (costPerKm <= 1) {
    return 'Excelente'
  }

  if (costPerKm <= 1.8) {
    return 'Bueno'
  }

  if (costPerKm <= 2.8) {
    return 'Regular'
  }

  return 'Malo'
}

export function getProfitabilityTone(result: string): BadgeTone {
  if (result === 'Excelente') return 'success'
  if (result === 'Bueno') return 'info'
  if (result === 'Regular' || result === 'En uso') return 'warning'
  return 'danger'
}
