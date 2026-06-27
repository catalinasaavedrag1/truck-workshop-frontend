import type { QuoteStatus } from '../types/quote.types'

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  APPROVED: 'Aprobada',
  DRAFT: 'Borrador',
  EXPIRED: 'Expirada',
  REJECTED: 'Rechazada',
  SENT: 'Enviada',
}
