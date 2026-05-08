import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightAssignmentStatus, FreightQuoteStatus, FreightRequestStatus } from '../types/freight.types'

export const FREIGHT_REQUEST_STATUS_LABELS: Record<FreightRequestStatus, string> = {
  APPROVED: 'Aprobada',
  ASSIGNED: 'Asignada',
  CANCELLED: 'Cancelada',
  DELIVERED: 'Entregada',
  IN_TRANSIT: 'En ruta',
  NEW: 'Nueva',
  QUOTE_SENT: 'Cotizacion enviada',
  QUOTING: 'En cotizacion',
  REJECTED: 'Rechazada',
}

export const FREIGHT_REQUEST_STATUS_TONES: Record<FreightRequestStatus, BadgeTone> = {
  APPROVED: 'success',
  ASSIGNED: 'info',
  CANCELLED: 'danger',
  DELIVERED: 'success',
  IN_TRANSIT: 'warning',
  NEW: 'neutral',
  QUOTE_SENT: 'info',
  QUOTING: 'warning',
  REJECTED: 'danger',
}

export const FREIGHT_QUOTE_STATUS_LABELS: Record<FreightQuoteStatus, string> = {
  APPROVED: 'Aprobada',
  DRAFT: 'Borrador',
  EXPIRED: 'Expirada',
  REJECTED: 'Rechazada',
  SENT: 'Enviada',
}

export const FREIGHT_QUOTE_STATUS_TONES: Record<FreightQuoteStatus, BadgeTone> = {
  APPROVED: 'success',
  DRAFT: 'neutral',
  EXPIRED: 'warning',
  REJECTED: 'danger',
  SENT: 'info',
}

export const FREIGHT_ASSIGNMENT_STATUS_LABELS: Record<FreightAssignmentStatus, string> = {
  CANCELLED: 'Cancelada',
  DELIVERED: 'Entregada',
  IN_TRANSIT: 'En ruta',
  SCHEDULED: 'Programada',
}
