export type DriverStatus = 'active' | 'inactive'

export type DriverDocumentType =
  | 'LICENSE'
  | 'IDENTITY'
  | 'MEDICAL_CERTIFICATE'
  | 'PSYCHOTECHNICAL'
  | 'TRAINING'
  | 'CONTRACT'

export type DriverDocumentStatus = 'VALID' | 'EXPIRES_SOON' | 'EXPIRED' | 'MISSING'

export type DriverFineSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type DriverFineStatus = 'OPEN' | 'UNDER_REVIEW' | 'PAID' | 'DISPUTED' | 'CLOSED'

export interface Driver {
  id: string
  name: string
  document: string
  phone: string
  company: string
  license: string
  status: DriverStatus
  caseIds: string[]
  createdAt: string
  updatedAt?: string
}

export interface DriverDocument {
  id: string
  driverId: string
  documentType: DriverDocumentType
  documentNumber?: string
  issuedAt?: string
  expiresAt?: string
  status: DriverDocumentStatus
  attachmentUrl?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}

export interface DriverFine {
  id: string
  fineNumber: string
  driverId: string
  truckId?: string
  incidentId?: string
  freightId?: string
  fineType: string
  severity: DriverFineSeverity
  status: DriverFineStatus
  occurredAt: string
  location: string
  amount?: number
  dueAt?: string
  paidAt?: string
  description: string
  documentUrl?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}
