import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type {
  DriverDocumentStatus,
  DriverDocumentType,
  DriverFineSeverity,
  DriverFineStatus,
} from '../types/driver.types'

export const driverDocumentTypeLabels: Record<DriverDocumentType, string> = {
  CONTRACT: 'Contrato',
  IDENTITY: 'Cedula / RUT',
  LICENSE: 'Licencia',
  MEDICAL_CERTIFICATE: 'Certificado medico',
  PSYCHOTECHNICAL: 'Psicotecnico',
  TRAINING: 'Capacitacion',
}

export const driverDocumentStatusLabels: Record<DriverDocumentStatus, string> = {
  EXPIRED: 'Vencido',
  EXPIRES_SOON: 'Por vencer',
  MISSING: 'Falta',
  VALID: 'Vigente',
}

export const driverDocumentStatusTones: Record<DriverDocumentStatus, BadgeTone> = {
  EXPIRED: 'danger',
  EXPIRES_SOON: 'warning',
  MISSING: 'danger',
  VALID: 'success',
}

export const driverFineStatusLabels: Record<DriverFineStatus, string> = {
  CLOSED: 'Cerrada',
  DISPUTED: 'Apelada',
  OPEN: 'Abierta',
  PAID: 'Pagada',
  UNDER_REVIEW: 'En revision',
}

export const driverFineStatusTones: Record<DriverFineStatus, BadgeTone> = {
  CLOSED: 'neutral',
  DISPUTED: 'warning',
  OPEN: 'danger',
  PAID: 'success',
  UNDER_REVIEW: 'warning',
}

export const driverFineSeverityLabels: Record<DriverFineSeverity, string> = {
  CRITICAL: 'Critica',
  HIGH: 'Alta',
  LOW: 'Baja',
  MEDIUM: 'Media',
}

export const driverFineSeverityTones: Record<DriverFineSeverity, BadgeTone> = {
  CRITICAL: 'danger',
  HIGH: 'danger',
  LOW: 'neutral',
  MEDIUM: 'warning',
}
