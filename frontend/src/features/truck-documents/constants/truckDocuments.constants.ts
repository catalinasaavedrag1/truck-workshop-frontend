import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { TruckDocumentStatus, TruckDocumentType } from '../types/truckDocuments.types'

export const truckDocumentTypeLabels: Record<TruckDocumentType, string> = {
  CIRCULATION_PERMIT: 'Permiso circulacion',
  TECHNICAL_INSPECTION: 'Revision tecnica',
  MANDATORY_INSURANCE: 'Seguro obligatorio',
  ADDITIONAL_INSURANCE: 'Seguro adicional',
  LEASING_CONTRACT: 'Contrato leasing',
  CERTIFICATE: 'Certificado',
  REGISTRATION: 'Padron',
  PURCHASE_INVOICE: 'Factura compra',
}

export const documentStatusLabels: Record<TruckDocumentStatus, string> = {
  VALID: 'Vigente',
  EXPIRES_SOON_30: 'Vence en 30 dias',
  EXPIRES_SOON_15: 'Vence en 15 dias',
  EXPIRED: 'Vencido',
  MISSING: 'Faltante',
}

export const documentStatusTones: Record<TruckDocumentStatus, BadgeTone> = {
  VALID: 'success',
  EXPIRES_SOON_30: 'warning',
  EXPIRES_SOON_15: 'warning',
  EXPIRED: 'danger',
  MISSING: 'danger',
}
