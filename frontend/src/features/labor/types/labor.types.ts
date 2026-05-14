export type LaborTaskStatus = 'pending' | 'in_progress' | 'done'

export interface LaborTask {
  id: string
  caseId: string
  description: string
  estimatedHours: number
  realHours?: number
  mechanicId: string
  mechanicName: string
  hourlyRate: number
  status: LaborTaskStatus
}
