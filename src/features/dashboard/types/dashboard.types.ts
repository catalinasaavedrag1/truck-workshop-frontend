export interface DashboardMetric {
  group?: string
  label: string
  value: string
  trend: string
}

export interface CasesByStatus {
  label: string
  value: number
}

export interface MechanicWorkloadItem {
  mechanicId: string
  mechanicName: string
  assignedCases: number
  maxCases: number
}
