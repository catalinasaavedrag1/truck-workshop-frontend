export type MaintenanceType =
  | 'OIL_CHANGE'
  | 'FILTERS'
  | 'BRAKES'
  | 'TIRES'
  | 'ALIGNMENT'
  | 'BATTERY'
  | 'SUSPENSION'
  | 'TECHNICAL_INSPECTION'
  | 'KM_SERVICE'

export type MaintenanceFrequencyType = 'KM' | 'DATE' | 'BOTH'

export type MaintenanceRiskStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'OVERDUE'

export interface PreventiveMaintenancePlan {
  id: string
  truckId: string
  maintenanceType: MaintenanceType
  description: string
  frequencyType: MaintenanceFrequencyType
  everyKm?: number
  everyDays?: number
  lastDoneAt?: string
  lastDoneOdometer?: number
  nextDueAt?: string
  nextDueOdometer?: number
  riskStatus: MaintenanceRiskStatus
  assignedTo: string
  notes?: string
}
