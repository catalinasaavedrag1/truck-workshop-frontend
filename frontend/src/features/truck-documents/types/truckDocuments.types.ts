export type TruckDocumentType =
  | 'CIRCULATION_PERMIT'
  | 'TECHNICAL_INSPECTION'
  | 'MANDATORY_INSURANCE'
  | 'ADDITIONAL_INSURANCE'
  | 'LEASING_CONTRACT'
  | 'CERTIFICATE'
  | 'REGISTRATION'
  | 'PURCHASE_INVOICE'

export type TruckDocumentStatus = 'VALID' | 'EXPIRES_SOON_30' | 'EXPIRES_SOON_15' | 'EXPIRED' | 'MISSING'

export interface TruckDocument {
  id: string
  truckId: string
  documentType: TruckDocumentType
  documentNumber?: string
  issuedAt?: string
  expiresAt?: string
  status: TruckDocumentStatus
  attachmentUrl?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedBy?: string
}

export type TruckDocumentPayload = Omit<TruckDocument, 'createdAt' | 'deletedBy' | 'id' | 'status' | 'updatedAt'>
