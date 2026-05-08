export type IncidentType =
  | 'ACCIDENT'
  | 'DAMAGE'
  | 'FINE'
  | 'THEFT'
  | 'DELAY'
  | 'CUSTOMER_ISSUE'
  | 'CARGO_ISSUE'
  | 'ROAD_FAILURE'
  | 'OTHER'

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type IncidentStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'

export interface Incident {
  id: string
  incidentNumber: string
  truckId: string
  driverId?: string
  freightId?: string
  workshopCaseId?: string
  incidentType: IncidentType
  severity: IncidentSeverity
  description: string
  occurredAt: string
  location: string
  estimatedCost?: number
  status: IncidentStatus
  documents: string[]
  photos: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string
  deletedBy?: string
}
