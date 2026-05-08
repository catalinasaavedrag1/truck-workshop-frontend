import type { BadgeTone } from '../../../shared/components/Badge/Badge'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export interface TruckServiceRisk {
  daysSinceService: number
  helper: string
  label: string
  progress: number
  tone: BadgeTone
}

export function getDaysSinceService(lastServiceAt: string) {
  const serviceDate = new Date(lastServiceAt)

  if (Number.isNaN(serviceDate.getTime())) {
    return 0
  }

  return Math.max(0, Math.floor((Date.now() - serviceDate.getTime()) / MS_PER_DAY))
}

export function getShortVin(vin: string) {
  return vin.length <= 8 ? vin : vin.slice(-8)
}

export function getTruckServiceRisk(lastServiceAt: string): TruckServiceRisk {
  const daysSinceService = getDaysSinceService(lastServiceAt)
  const progress = Math.min(100, Math.round((daysSinceService / 45) * 100))

  if (daysSinceService > 45) {
    return {
      daysSinceService,
      helper: 'Priorizar revision antes de liberar a ruta.',
      label: 'Servicio vencido',
      progress,
      tone: 'danger',
    }
  }

  if (daysSinceService > 30) {
    return {
      daysSinceService,
      helper: 'Programar mantencion preventiva.',
      label: 'Requiere agenda',
      progress,
      tone: 'warning',
    }
  }

  return {
    daysSinceService,
    helper: 'Sin accion inmediata por servicio.',
    label: 'Al dia',
    progress,
    tone: 'success',
  }
}
