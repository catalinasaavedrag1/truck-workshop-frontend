import type { CargoType } from '../types/freight.types'

export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  BULK: 'Granel',
  FRAGILE: 'Fragil',
  GENERAL: 'General',
  HAZARDOUS: 'Peligrosa',
  OVERSIZED: 'Sobredimensionada',
  PALLETIZED: 'Paletizada',
  REFRIGERATED: 'Refrigerada',
}

export const CARGO_TYPE_OPTIONS: Array<{ label: string; value: CargoType }> = [
  { label: CARGO_TYPE_LABELS.GENERAL, value: 'GENERAL' },
  { label: CARGO_TYPE_LABELS.PALLETIZED, value: 'PALLETIZED' },
  { label: CARGO_TYPE_LABELS.BULK, value: 'BULK' },
  { label: CARGO_TYPE_LABELS.FRAGILE, value: 'FRAGILE' },
  { label: CARGO_TYPE_LABELS.REFRIGERATED, value: 'REFRIGERATED' },
  { label: CARGO_TYPE_LABELS.HAZARDOUS, value: 'HAZARDOUS' },
  { label: CARGO_TYPE_LABELS.OVERSIZED, value: 'OVERSIZED' },
]
