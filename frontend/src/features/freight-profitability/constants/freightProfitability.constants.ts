import type { BadgeTone } from '../../../shared/components/Badge/Badge'

export type FreightMarginStatus = 'HIGH' | 'OK' | 'LOW' | 'NEGATIVE'

export const freightMarginLabels: Record<FreightMarginStatus, string> = {
  HIGH: 'Alta',
  OK: 'Saludable',
  LOW: 'Baja',
  NEGATIVE: 'Negativa',
}

export const freightMarginTones: Record<FreightMarginStatus, BadgeTone> = {
  HIGH: 'success',
  OK: 'info',
  LOW: 'warning',
  NEGATIVE: 'danger',
}

export function getFreightMarginStatus(marginPercentage: number): FreightMarginStatus {
  if (marginPercentage < 0) {
    return 'NEGATIVE'
  }

  if (marginPercentage < 15) {
    return 'LOW'
  }

  if (marginPercentage < 30) {
    return 'OK'
  }

  return 'HIGH'
}
