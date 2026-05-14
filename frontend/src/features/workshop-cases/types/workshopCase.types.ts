import type { EscalationLevel, EscalationReason } from '../../escalation/types/escalation.types'
import type { SlaStatus } from '../../sla/types/sla.types'

export type WorkshopCaseStatus =
  | 'new'
  | 'diagnosis'
  | 'solution'
  | 'assigned'
  | 'repairing'
  | 'testing'
  | 'closed'

export type WorkshopCasePriority = 'low' | 'medium' | 'high' | 'critical'
export type WorkshopCaseIntakeSource = 'driver' | 'fleet' | 'telematics' | 'preventive' | 'other'
export type WorkshopCaseFailureCategory =
  | 'engine'
  | 'brakes'
  | 'electrical'
  | 'transmission'
  | 'tires'
  | 'documents'
  | 'body'
  | 'preventive'
  | 'other'

export type RequiredPartStatus =
  | 'available'
  | 'low_stock'
  | 'out_of_stock'
  | 'purchase_required'
  | 'po_created'
  | 'waiting_reception'

export interface CaseRequiredPart {
  partId: string
  sku: string
  name: string
  quantity: number
  stockAvailable: number
  status: RequiredPartStatus
  requiresPurchase: boolean
  purchaseRequestId?: string
  purchaseOrderId?: string
}

export interface WorkshopCase {
  id: string
  caseNumber: string
  code: string
  truckId: string
  truckPlate: string
  driverId: string
  driverName: string
  customerId?: string
  customerName: string
  customer: string
  failureDescription: string
  title: string
  intakeSource?: WorkshopCaseIntakeSource
  intakeLocation?: string
  reportedByName?: string
  reportedByPhone?: string
  odometerAtEntry?: number
  failureCategory?: WorkshopCaseFailureCategory
  symptoms?: string[]
  safetyImpact?: boolean
  immobilized?: boolean
  diagnosisRequested?: string
  serviceType?: string
  downtimeImpact?: string
  status: WorkshopCaseStatus
  priority: WorkshopCasePriority
  assignedMechanicId?: string
  mechanicId?: string
  mechanicName?: string
  warehouseManagerId?: string
  warehouseManagerName?: string
  slaId: string
  slaDueAt: string
  slaStatus: SlaStatus
  escalationLevel: EscalationLevel
  escalationReason?: EscalationReason
  requiredParts: CaseRequiredPart[]
  purchaseRequestIds: string[]
  createdAt: string
  updatedAt: string
  estimatedDeliveryAt?: string
  estimatedCost: number
  currentStep: string
  closeReason?: string
  closureSummary?: string
  closedAt?: string
  closedBy?: string
}

export interface WorkshopCaseFilters {
  query: string
  status: WorkshopCaseStatus | 'all'
  priority: WorkshopCasePriority | 'all'
  slaStatus: SlaStatus | 'all'
}
